
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.MemoryCacheImageOutputStream;

import java.util.regex.Matcher;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.Base64;
import java.util.Comparator;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.FileNotFoundException;

public class CHSCDN {

    private String apilink;
    private String weblink;
    private String cdnlink;
    private String apikey = "";

    private final List<String> imgExtensions = Arrays.asList(
        ".jpg", ".jpeg", ".png", ".peng", ".bmp", ".gif", ".webp", ".svg", ".jpe", ".jfif", ".tar", ".tiff", ".tga"
    );

    private final List<String> vdoExtensions = Arrays.asList(
        ".mp4", ".mov", ".wmv", ".avi", ".avchd", ".flv", ".f4v", ".swf", ".mkv", ".webm", ".html5"
    );

    public CHSCDN() {
        this.apilink = "https://chsapi.vercel.app";
        this.weblink = "https://chsweb.vercel.app";
        this.cdnlink = "https://chscdn.vercel.app";

        checkInternet();

        String env = System.getenv("APP_ENV");
        if ("development".equalsIgnoreCase(env)) {
            developerMode();
        }
    }

    private void developerMode() {
        this.apilink = "http://127.0.0.1:8000";
        this.weblink = "http://127.0.0.1:5000";
        this.cdnlink = "http://127.0.0.1:8080";
    }

    private void checkInternet() {
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL("https://www.google.com").openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(3000);
            connection.setReadTimeout(3000);
            connection.connect();

            if (connection.getResponseCode() != 200) {
                System.err.println("ERR_INTERNET_DISCONNECTED: Unable to reach the internet.");
            }
        } catch (IOException e) {
            System.err.println("ERR_INTERNET_DISCONNECTED: Network error during internet check.\n" +
                "Please verify your connection and try again.\n");
        }
    }

    public String getApilink() {
        return apilink;
    }

    public String getWeblink() {
        return weblink;
    }

    public List<String> getImageExtensions() {
        return imgExtensions;
    }

    public List<String> getVideoExtensions() {
        return vdoExtensions;
    }

    public boolean inputVerified(Map<String, Object> values) {
        if (values == null || values.isEmpty()) return false;

        return values.containsKey("task") && values.containsKey("media")
            && values.get("task") instanceof String
            && values.get("media") instanceof String;
    }

    public String mediaType(String base64Str) {
        if (base64Str == null || !base64Str.contains("data:")) return null;
        String[] parts = base64Str.split("[:;/]");
        if (parts.length > 1) {
            String type = parts[1].toLowerCase();
            if (type.equals("image") || type.equals("video")) {
                return type;
            }
        }
        return null;
    }

    private String extractExtension(String link) {
        if (link == null || link.isEmpty()) {
            return null;
        }
        if (link.startsWith("data:image/")) {
            try {
                String mime = link.substring("data:image/".length());
                int semiColonIndex = mime.indexOf(';');
                if (semiColonIndex > 0) {
                    return "." + mime.substring(0, semiColonIndex).toLowerCase(); // Example: ".png"
                }
            } catch (Exception e) {
                return null;
            }
        } else {
            int dotIndex = link.lastIndexOf('.');
            if (dotIndex >= 0 && dotIndex < link.length() - 1) {
                String ext = link.substring(dotIndex).split("\\?")[0];
                return ext.toLowerCase();
            }
        }
        return null;
    }

    public boolean isValidImage(String link) {
        if (link == null) return false;
        String ext = extractExtension(link);
        return ext != null && imgExtensions.contains(ext.toLowerCase());
    }

    public boolean isValidVideo(String link) {
        if (link == null) return false;
        String ext = extractExtension(link);
        return ext != null && vdoExtensions.contains(ext.toLowerCase());
    }

    private String getExtension(String filePath) {
        int dotIndex = filePath.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < filePath.length() - 1) {
            return filePath.substring(dotIndex);
        }
        return "";
    }

    public Integer base64_size(String base64String) {
        if (base64String == null || !base64String.startsWith("data:")) {
            System.out.println("TypeError:\nExpected a valid base64 string starting with 'data:', but got: " +
                (base64String == null ? "null" : base64String.getClass().getSimpleName()));
            return null;
        }
        int sizeInBytes = base64String.getBytes(StandardCharsets.UTF_8).length;
        return sizeInBytes / 1024; // Size in KB
    }

    private double base64SizeKB(String base64) {
        int len = base64.length() * 3 / 4;
        if (base64.endsWith("==")) len -= 2;
        else if (base64.endsWith("=")) len -= 1;
        return len / 1024.0;
    }

    public String getMediaExtension(String base64String) {
        if (base64String == null || !base64String.startsWith("data:")) return null;

        Pattern pattern = Pattern.compile("^data:([a-z]+/[a-z0-9-+.]+);");
        Matcher matcher = pattern.matcher(base64String);
        if (matcher.find()) {
            String mimeType = matcher.group(1);
            return mimeType.contains("/") ? mimeType.split("/")[1] : null;
        }

        return null;
    }


    public String image2base64(String filePath) throws IOException {
        if (!isValidImage(filePath)) {
            System.err.println("Extension_Exception: Provided media has unsupported image extension.\n" +
                "Please provide the media with a valid extension. For more understanding visit:\n" +
                "https://chsweb.vercel.app/docs?search=extension\n");
            throw new IllegalArgumentException("Unsupported image extension");
        }

        File file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException("File not found: " + filePath);
        }

        String ext = getExtension(filePath).replace(".", "").toLowerCase();
        byte[] data = Files.readAllBytes(file.toPath());
        String base64 = Base64.getEncoder().encodeToString(data);
        return "data:image/" + ext + ";base64," + base64;
    }

    public String image_to_base64(String link) throws IOException {
        Map<String, String> mimeMap = new HashMap<>() {{
            put("jpg", "image/jpeg");
            put("jpeg", "image/jpeg");
            put("jpe", "image/jpeg");
            put("jfif", "image/jpeg");
            put("png", "image/png");
            put("peng", "image/png");
            put("bmp", "image/bmp");
            put("gif", "image/gif");
            put("webp", "image/webp");
            put("svg", "image/svg+xml");
            put("tiff", "image/tiff");
            put("tga", "image/x-tga");
            put("tar", "application/x-tar");
        }};

        String ext = getExtension(link).replace(".", "").toLowerCase();
        String mimeType = mimeMap.get(ext);

        if (mimeType == null) {
            System.err.println("Extension_Exception: Provided media has unsupported image extension.\n" +
                "Please provide the media with valid extension.\nVisit:\n" +
                "https://chsweb.vercel.app/docs?search=extension\n");
            throw new IllegalArgumentException("Unsupported image extension");
        }

        File file = new File(link);
        if (!file.exists()) {
            throw new FileNotFoundException("File not found: " + link);
        }

        byte[] buffer = Files.readAllBytes(file.toPath());
        String base64String = Base64.getEncoder().encodeToString(buffer);
        return "data:" + mimeType + ";base64," + base64String;
    }

    public String video2base64(String link) throws IOException {
        if (!isValidVideo(link)) {
            System.err.println("Extension_Exception: Provided media has unsupported video extension\n" +
                "Please provide a valid extension. Visit:\n" +
                "https://chsweb.vercel.app/docs?search=extension\n");
            throw new IllegalArgumentException("Unsupported video extension");
        }

        String extension = getExtension(link).replace(".", "").toLowerCase();
        String mimeType = "video/" + extension;
        byte[] buffer;

        if (link.startsWith("http://") || link.startsWith("https://")) {
            try (InputStream in = new URL(link).openStream()) {
                buffer = in.readAllBytes();
            } catch (IOException ex) {
                throw new IOException("VideoRead_Exception: Failed to fetch video from URL - " + ex.getMessage());
            }
        } else {
            File file = new File(link);
            if (!file.exists()) throw new FileNotFoundException("Video file not found: " + link);
            buffer = Files.readAllBytes(file.toPath());
        }

        String base64 = Base64.getEncoder().encodeToString(buffer);
        return "data:" + mimeType + ";base64," + base64;
    }

    public List<Map<String, String>> extractFramesFromBase64Video(String base64Video, int fps) throws IOException, InterruptedException {
        List<Map<String, String>> frames = new ArrayList<>();

        Pattern pattern = Pattern.compile("^data:video/\\w+;base64,(.*)$");
        Matcher matcher = pattern.matcher(base64Video);
        if (!matcher.find()) throw new IllegalArgumentException("Invalid base64 video format.");

        byte[] videoBytes = Base64.getDecoder().decode(matcher.group(1));

        Path tempVideoPath = Paths.get("temp_input_video.mp4");
        Files.write(tempVideoPath, videoBytes);

        Path outputDir = Paths.get("frames_output");
        Files.createDirectories(outputDir);

        String outputPattern = outputDir.resolve("frame-%03d.jpg").toString();
        ProcessBuilder builder = new ProcessBuilder(
            "ffmpeg",
            "-i", tempVideoPath.toString(),
            "-vf", "fps=" + fps,
            outputPattern
        );

        builder.redirectErrorStream(true);
        Process process = builder.start();
        process.waitFor();

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(outputDir, "*.jpg")) {
            List<Path> sortedFiles = new ArrayList<>();
            for (Path entry : stream) sortedFiles.add(entry);
            sortedFiles.sort(Comparator.comparing(Path::toString));

            for (int i = 0; i < sortedFiles.size(); i++) {
                byte[] imageBytes = Files.readAllBytes(sortedFiles.get(i));
                String base64Image = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(imageBytes);

                Map<String, String> frame = new HashMap<>();
                frame.put("second", String.valueOf(i));
                frame.put("image", base64Image);
                frames.add(frame);

                Files.delete(sortedFiles.get(i));
            }
        }

        // Cleanup
        Files.deleteIfExists(tempVideoPath);
        Files.delete(outputDir);

        return frames;
    }

    public String compressBase64Image(String base64Image, int maxSizeKB, int minSkipSizeKB) throws IOException {
        if (base64SizeKB(base64Image) < minSkipSizeKB) {
            return base64Image;
        }

        String strippedBase64 = base64Image.replaceAll("^data:image/\\w+;base64,", "");
        byte[] imageBytes = Base64.getDecoder().decode(strippedBase64);

        InputStream inputStream = new ByteArrayInputStream(imageBytes);
        BufferedImage image = ImageIO.read(inputStream);

        int quality = 95;
        byte[] outputBytes = null;

        while (quality >= 10) {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(quality / 100f);

            writer.setOutput(new MemoryCacheImageOutputStream(outputStream));
            writer.write(null, new IIOImage(image, null, null), param);
            writer.dispose();

            outputBytes = outputStream.toByteArray();
            String compressedBase64 = Base64.getEncoder().encodeToString(outputBytes);

            if (base64SizeKB(compressedBase64) <= maxSizeKB) {
                return "data:image/jpeg;base64," + compressedBase64;
            }

            quality -= 5;
        }

        return "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(outputBytes);
    }

    private boolean sendPart(String part, int index, int limit, String url, String key) {
        int attempts = 0;
        while (attempts < 3) {
            attempts++;
            try {
                URL endpoint = new URL(url + "/load/single");
                HttpURLConnection conn = (HttpURLConnection) endpoint.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);

                String payload = String.format("{\"img\":\"%s\",\"limit\":%d,\"index\":%d,\"key\":\"%s\"}",
                        part, limit, index, key);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(payload.getBytes(StandardCharsets.UTF_8));
                }

                int responseCode = conn.getResponseCode();
                if (responseCode == 200) {
                    String responseBody = new BufferedReader(new InputStreamReader(conn.getInputStream())).lines().collect(Collectors.joining());

                    if (responseBody.contains("\"ack\":" + index)) {
                        return true;
                    }
                }
            } catch (IOException e) {
                if (e.getMessage().contains("Connection refused")) return false;
                System.out.printf("Error on attempt %d for part %d: %s%n", attempts, index, e.getMessage());
            }
        }
        return false;
    }

    public Object loadMedia(String base64String) {
        if (base64String == null) base64String = "";

        int limit = (int) Math.floor(base64SizeKB(base64String) / 900) + 2;
        int partLength = (int) Math.ceil((double) base64String.length() / limit);
        List<String> parts = new ArrayList<>();

        for (int i = 0; i < limit; i++) {
            int start = i * partLength;
            int end = Math.min((i + 1) * partLength, base64String.length());
            parts.add(base64String.substring(start, end));
        }

        for (int i = 0; i < parts.size(); i++) {
            boolean isSuccess = sendPart(parts.get(i), i + 1, limit, this.apilink, this.apikey);
            if (!isSuccess) return 24;
        }

        return true;
    }

    private String convertToJson(Object obj) {
        if (obj instanceof Map<?, ?> map) {
            StringBuilder json = new StringBuilder("{");
            for (Object key : map.keySet()) {
                Object value = map.get(key);
                json.append("\"").append(key.toString()).append("\":");
                json.append("\"").append(value.toString()).append("\",");
            }
            if (json.charAt(json.length() - 1) == ',') {
                json.deleteCharAt(json.length() - 1);
            }
            json.append("}");
            return json.toString();
        }
        throw new IllegalArgumentException("Unsupported token type for manual JSON conversion");
    }

    public String chsAPI(String uri, Object token) {
        try {
            String jsonToken = convertToJson(token);

            URL url = new URL(uri);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonToken.getBytes(StandardCharsets.UTF_8);
                os.write(input);
            }

            int status = conn.getResponseCode();
            InputStream stream = (status >= 200 && status < 300) ? conn.getInputStream() : conn.getErrorStream();

            String responseText = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8)).lines().collect(Collectors.joining());

            if (status >= 200 && status < 300) {
                return responseText;
            } else {
                System.err.println("API Error: " + responseText);
                return null;
            }
        } catch (IOException e) {
            System.err.println("Error calling API: " + e.getMessage());
            return null;
        }
    }

    public Map<String, Object> analyzeClassificationSequence(List<Map<String, Object>> predictions) {
        if (predictions == null || predictions.isEmpty()) {
            return Map.of("error", "Empty prediction list");
        }

        List<Map<String, Object>> fakeSequences = new ArrayList<>();
        List<Map<String, Object>> currentSequence = new ArrayList<>();

        for (Map<String, Object> item : predictions) {
            String label = ((String) item.getOrDefault("class", "")).toLowerCase();
            if (label.equals("fake")) {
                currentSequence.add(item);
                if (currentSequence.size() >= 2) {
                    fakeSequences = new ArrayList<>(currentSequence);
                }
            } else {
                currentSequence.clear();
            }
        }

        if (!fakeSequences.isEmpty()) {
            double totalAccuracy = fakeSequences.stream().mapToDouble(f -> ((Number) f.get("accuracy")).doubleValue()).sum();
            double avgAccuracy = Math.round((totalAccuracy / fakeSequences.size()) * 100.0) / 100.0;
            Object startTime = fakeSequences.get(0).get("second");
            Object endTime = fakeSequences.get(fakeSequences.size() - 1).get("second");

            return Map.of(
                    "class", "Fake",
                    "accuracy", avgAccuracy,
                    "period", List.of(startTime, endTime)
            );
        }

        List<Map<String, Object>> realPreds = predictions.stream().filter(p -> ((String) p.getOrDefault("class", "")).toLowerCase().equals("real")).collect(Collectors.toList());

        if (!realPreds.isEmpty()) {
            double totalAccuracy = realPreds.stream().mapToDouble(p -> ((Number) p.get("accuracy")).doubleValue()).sum();
            double avgAccuracy = Math.round((totalAccuracy / realPreds.size()) * 100.0) / 100.0;
            Object startTime = realPreds.get(0).get("second");
            Object endTime = realPreds.get(realPreds.size() - 1).get("second");

            return Map.of(
                    "class", "Real",
                    "accuracy", avgAccuracy,
                    "period", List.of(startTime, endTime)
            );
        }

        return Map.of("error", "No valid classification data");
    }

    public Map<String, Map<String, Object>> loosParameterRecover() {
        Map<String, Object> proto1 = Map.of("class", "Real", "accuracy", 50);
        Map<String, Object> proto2 = Map.of("class", "Fake", "accuracy", 50);
        Map<String, Object> proto3 = Map.of("class", "Fake", "accuracy", 50);
        return Map.of(
                "prototype_1", proto1,
                "prototype_2", proto2,
                "prototype_3", proto3
        );
    }

    public Map<String, Map<String, Object>> summarizePrototypeResults(List<Map<String, Map<String, Object>>> responseTree) {
        Map<String, Map<String, Object>> summaryResult = new HashMap<>();
        Map<String, Map<String, Map<String, Object>>> summary = new HashMap<>();

        for (Map<String, Map<String, Object>> entry : responseTree) {
            for (Map.Entry<String, Map<String, Object>> proto : entry.entrySet()) {
                String key = proto.getKey();
                Map<String, Object> result = proto.getValue();
                String label = ((String) result.get("class")).toLowerCase();
                double accuracy = ((Number) result.get("accuracy")).doubleValue();

                summary.putIfAbsent(key, new HashMap<>());
                Map<String, Object> real = summary.get(key).getOrDefault("real", Map.of("count", 0, "totalAccuracy", 0.0));
                Map<String, Object> fake = summary.get(key).getOrDefault("fake", Map.of("count", 0, "totalAccuracy", 0.0));

                if (label.equals("real")) {
                    int count = (int) real.get("count") + 1;
                    double totalAcc = (double) real.get("totalAccuracy") + accuracy;
                    summary.get(key).put("real", Map.of("count", count, "totalAccuracy", totalAcc));
                } else if (label.equals("fake")) {
                    int count = (int) fake.get("count") + 1;
                    double totalAcc = (double) fake.get("totalAccuracy") + accuracy;
                    summary.get(key).put("fake", Map.of("count", count, "totalAccuracy", totalAcc));
                }
            }
        }

        for (Map.Entry<String, Map<String, Map<String, Object>>> entry : summary.entrySet()) {
            String proto = entry.getKey();
            Map<String, Object> real = entry.getValue().getOrDefault("real", Map.of("count", 0, "totalAccuracy", 0.0));
            Map<String, Object> fake = entry.getValue().getOrDefault("fake", Map.of("count", 0, "totalAccuracy", 0.0));

            int realCount = (int) real.get("count");
            double realAcc = (double) real.get("totalAccuracy");

            int fakeCount = (int) fake.get("count");
            double fakeAcc = (double) fake.get("totalAccuracy");

            String finalClass = (fakeCount > realCount) ? "Fake" : "Real";
            double finalAccuracy = (fakeCount > realCount) ? Math.round((fakeAcc / fakeCount) * 100.0) / 100.0 : Math.round((realAcc / realCount) * 100.0) / 100.0;

            summaryResult.put(proto, Map.of("class", finalClass, "accuracy", finalAccuracy));
        }

        return summaryResult;
    }    

    public boolean noiseDetect(Object data) {
        try {
            double value = Double.parseDouble(data.toString());
            return !Boolean.TRUE.equals(data);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public boolean handleError(Object code) {
        try {
            if (!Boolean.TRUE.equals(code)) {
                System.out.println(code);
                return false;
            }
        } catch (Exception e) {
            System.out.println("Error found to handle error\n" + e.getMessage());
            return false;
        }
        return true;
    }

    public boolean errorDetect(Object response, String permiteToSpeck) {
        try {
            double numericResponse = Double.parseDouble(response.toString());

            if (!"mute".equals(permiteToSpeck)) {
                System.err.println("APICallError:\nYou are hitting an unexpected error while processing the API response\n" +
                                "Error pointer: " + numericResponse + "\n\n" +
                                "Please check out the error logs of CHS: https://chsweb.vercel.app/docs?search=error%20log\n\n");
            }
            return true;
        } catch (NumberFormatException e) {
            if (response instanceof Map) {
                Map<?, ?> respMap = (Map<?, ?>) response;

                boolean hasAllKeys = respMap.containsKey("result") &&
                                    respMap.containsKey("metadata") &&
                                    respMap.containsKey("network");

                if ("mute".equals(permiteToSpeck)) return false;

                if (hasAllKeys) {
                    System.out.println("No error detected, You are good to go.\n");
                } else {
                    System.out.println("Response_Exception: Some parameters are missing in the response.\n" +
                                    "Please ensure that the response does not contain errors and that it originates from CHSAPI.\n\n");
                }
                return false;
            }
            return false;
        }
    }

    public void test() {
        System.out.println("Ahoy hoy, this java lib worked!");
    }

    @SuppressWarnings("unchecked")
    public Object dfd(Map<String, Object> values) {
        try {
            String media = (String) values.get("media");
            String mediaType = mediaType(media);
            
            if (mediaType.equals("image") && isValidImage(media)) {
                Object connection = loadMedia(media);
                if (noiseDetect(connection)) return handleError(connection);

                Object response = chsAPI(apilink + "/api/dfdScanner", Map.of(
                        "ext", getMediaExtension(media),
                        "media", "",
                        "load", "true",
                        "key", apikey,
                        "heatmap", "false"
                ));

                if (noiseDetect(response)) return handleError(response);
                return response;
            } else if (mediaType.equals("video") && isValidVideo(media)) {
                List<Map<String, String>> frames = extractFramesFromBase64Video(media, 1);
                List<Map<String, Object>> predictionList = new ArrayList<>();
                List<Map<String, Map<String, Object>>> responseTree = new ArrayList<>();
                int firstFailer = 0;

                for (int i = 0; i < frames.size(); i++) {
                    String imageData = (String) frames.get(i).get("image");
                    imageData = compressBase64Image(imageData, 900, 600);
                    try {
                        Object connection = loadMedia(imageData);
                        if (noiseDetect(connection)) return handleError(connection);

                        Object response = chsAPI(apilink + "/api/dfdScanner", Map.of(
                                "ext", getMediaExtension(imageData),
                                "media", "",
                                "load", "true",
                                "key", apikey,
                                "heatmap", "false"
                        ));

                        if (noiseDetect(response)) return handleError(response);

                        Map<String, Object> data = (Map<String, Object>) response;
                        Map<String, Object> prediction = new HashMap<>();
                        prediction.put("second", frames.get(i).get("second"));
                        prediction.putAll((Map<String, Object>) data.get("result"));

                        predictionList.add(prediction);
                        responseTree.add((Map<String, Map<String, Object>>) ((Map<String, Object>) data.get("result")).get("responce_tree"));
                    } catch (Exception error) {
                        System.err.println("Error on frame " + i + ": " + error.getMessage());
                        if (firstFailer == 0) {
                            firstFailer++;
                            i--;
                        } else {
                            responseTree.add(loosParameterRecover());
                        }
                    }
                }

                Map<String, Map<String, Object>> responseTreeSummary = summarizePrototypeResults(responseTree);
                Map<String, Object> result = analyzeClassificationSequence(predictionList);
                result.put("responce_tree", responseTreeSummary);

                Map<String, Object> metadata = Map.of(
                        "version", "1.0.0",
                        "header", Map.of("Content-Type", "application/json")
                );

                Map<String, Object> network = Map.of(
                        "url", "https://chsapi.vercel.app/api/",
                        "kernel", "inphant api",
                        "provider", "chsapi"
                );

                Map<String, Object> data = Map.of(
                        "result", result,
                        "metadata", metadata,
                        "network", network,
                        "source", "WHITE LOTUS Community"
                );
                return data;
            } else {
                System.err.println("Media_Exception: Provided media has no valid type\nPlease provide image or video.\nVisit: https://chsweb.vercel.app/docs?search=extension");
                return null;
            }
        } catch (Exception e) {
            System.err.println("APICallError:\n" + e.getMessage());
            return null;
        }
    }

    public Object imgConverter(Map<String, Object> values) {
        try {
            String media = (String) values.get("media");
            String extension = (String) values.get("extension");
            String mediaType = mediaType(media);
            boolean validImage = isValidImage(media);

            if (mediaType.equals("image") && validImage) {
                Object connection = loadMedia(media);
                if (noiseDetect(connection)) return handleError(connection);

                Map<String, Object> requestPayload = Map.of(
                    "form", extension,
                    "img", "",
                    "load", "true",
                    "key", apikey
                );

                Object response = chsAPI(apilink + "/api/imageConverter", requestPayload);
                if (noiseDetect(response)) return handleError(response);

                return response;
            } else {
                System.err.println("Media_Exception: Provided media has not pre-defined media type,\n" +
                                "Please provide a valid media type as image only.\n" +
                                "Visit: https://chsweb.vercel.app/docs?search=extension");
                return null;
            }
        } catch (Exception e) {
            System.err.println("APICallError:\n" + e.getMessage());
            return null;
        }
    }

    private Object imgCompressor(Map<String, Object> values) { return Map.of("response", "imgcompressor exected"); }
    private Object imgGenerator(Map<String, Object> values) { return Map.of("response", "imggenerator execued"); }
    private Object imgtopdf(Map<String, Object> values) { return Map.of("response", "imgtopdf executed"); }

    public Object APICaller(Map<String, Object> values) {
        if (!inputVerified(values)) {
            System.out.println("Structural_Exception: Please use required inputs structure to use chsapi\n" +
                    "For documentation, visit: https://chsweb.vercel.app/docs?search=basemodel\n" +
                    "Or watch: https://youtube.com/@whitelotus4\n");
            return null;
        }

        String task = (String) values.get("task");
        Object response = "";

        switch (task) {
            case "deepfake detect":
                response = dfd(values); break;
            case "image converter":
                response = imgConverter(values); break;
            case "image compressor":
                response = imgCompressor(values); break;
            case "text to image generator":
                response = imgGenerator(values); break;
            case "image to pdf":
                response = imgtopdf(values); break;
            default:
                System.out.println("Operation_Exception: Undefined task provided.\nGiven task: " + task +
                        "\nPlease use a supported operation.\n");
        }

        return response;
    }

    public static void main(String[] args) {
        CHSCDN cdn = new CHSCDN();

        String filePath = "D:/.vscode/Vs programmes/Df Detector/chscdn/bin/asset1.jpg";
        try {
            String base64Image = cdn.image2base64(filePath);
            
            Map<String, Object> apiParams = new HashMap<>();
            apiParams.put("task", "deepfake detect");
            apiParams.put("media", base64Image);

            Object response = cdn.APICaller(apiParams);

            System.out.println("API Response: " + response);

        } catch (IOException e) {
            System.err.println("Error processing image: " + e.getMessage());
        }

    }

} 