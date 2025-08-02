**📦 CHSCDN Package Setup Guide**

If you have downloaded the CHSCDN library and placed it in the `./CHSCDN/` folder on your local machine (including `.java`, `.class`, and `.jar` files), you can integrate it into your Java projects using one of the methods below:

---

### 💻 1. Standard Java Project (Without Build Tool)

If you're compiling manually or using an IDE like IntelliJ or Eclipse:

**Compile and run using the JAR:**

```bash
javac -cp ./CHSCDN/CHSCDN.jar YourMainClass.java
java -cp .:./CHSCDN/CHSCDN.jar YourMainClass
```

> For Windows users:
```cmd
java -cp .;CHSCDN\CHSCDN.jar YourMainClass
```

**IDE Integration (Eclipse / IntelliJ IDEA):**
- Navigate to Project Settings → Libraries
- Add the JAR: `./CHSCDN/CHSCDN.jar`
- You’re now ready to use CHSCDN classes

---

### 📦 2. Maven Project Setup

#### Option A: Install JAR into Local Maven Repository

Run the following command:

```bash
mvn install:install-file \
  -Dfile=./CHSCDN/CHSCDN.jar \
  -DgroupId=com.chscdn \
  -DartifactId=chscdn \
  -Dversion=1.0 \
  -Dpackaging=jar
```

Then add the dependency in `pom.xml` or update our provided `pom.xml` and use it:

```xml
<dependency>
  <groupId>com.chscdn</groupId>
  <artifactId>chscdn</artifactId>
  <version>1.0</version>
</dependency>
```

#### Option B: Add JAR Manually

1. Create a `lib/` folder inside your Maven project
2. Move `CHSCDN.jar` into it
3. Add this to `pom.xml`:

```xml
<dependency>
  <groupId>com.chscdn</groupId>
  <artifactId>chscdn</artifactId>
  <version>1.0</version>
  <scope>system</scope>
  <systemPath>${project.basedir}/lib/CHSCDN.jar</systemPath>
</dependency>
```

> ⚠️ Note: This method is suitable for local use, but not recommended for deployment environments.

---

### 🛠️ 3. Gradle Project Setup

**Steps:**
1. Create a `libs/` directory in your project
2. Place the `CHSCDN.jar` inside

In `build.gradle`:

```groovy
repositories {
    flatDir {
        dirs 'libs'
    }
}

dependencies {
    implementation name: 'chscdn'
}
```

---

### 📂 Using Source Code Files (`.java`)

If you prefer working directly with the source:

- Copy all `.java` files from `./CHSCDN/` into your project's `src/main/java/` directory
- These will be compiled with the rest of your project

---

### Example useage (example.txt)

If you not understand how to use or call the CHSCDN class then we provide a example file where we write a scratch code to make instance of CHSCDN class and call CHSAPI for image processing.
The file present in '/example.java' path of this package. 

If this guide not help you to setup and use our CHSCDN java package then don't warry contact us for help, contact email - info.whitelotus24@gmail.com


