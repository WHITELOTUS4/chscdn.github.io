# 🎭 CHSCDN - Cavernous Hoax Scanner CDN 📡  
### A Project by WHITE LOTUS 🌸  

## Introduction  
Welcome to **CHSCDN**! Designed as a **helping hand** for the **Cavernous Hoax Scanner API (CHSAPI)**, this Content Delivery Network (CDN) project provides essential **JavaScript, TypeScript, and CSS libraries** to simplify API communication and frontend integration. With **pre-built functions, UI utilities, and feature-rich components**, CHSCDN empowers developers to integrate CHSAPI effortlessly into their web projects.  

![CHSCDN](https://kidKrishkode.github.io/Streamline-Diagnosis.github.io/images/Cavernous.png)  

## Features ✨  
CHSCDN offers a wide range of tools and pre-written utilities:  
1. **API Communication Functions**: Easily interact with CHSAPI using built-in methods.  
2. **JS & TS Utilities**: Simplified functions for handling API requests, responses, and error handling.  
3. **CSS Components**: Ready-to-use styles for seamless UI integration.  
4. **Pre-built Methods**: Optimized approaches to enhance API interactions.  
5. **Image Highlighter**: A feature to highlight and annotate images dynamically.  
6. **Image Representation**: Pre-written functions for better visual image handling in web applications.  
7. **Secure & Fast**: Built with performance and security in mind.  
8. **Cross-Platform Compatibility**: Works in any frontend project (HTML, CSS, JS).  

## Why CHSCDN? 🌟  
- **Developer-Friendly**: Simple functions to interact with CHSAPI without complex setup.  
- **Optimized Performance**: Enhances speed and efficiency while working with CHSAPI.  
- **Modular & Scalable**: Use only the components you need, making it lightweight.  
- **Pre-Written Codebase**: Saves time and effort by providing reusable utilities.  

## Built With 💻  
- **JavaScript & TypeScript**: Provides flexible API interaction and UI utilities.  
- **CSS**: Pre-designed styles for a smooth frontend experience.  
- **JPEN Stack**: Integration of **JSON, Python, Embedded JavaScript, and Node.js**, ensuring a seamless connection between frontend and CHSAPI.  

## Who We Are? 🤝  
**WHITE LOTUS** is the creative team behind CHSCDN. Our core contributors:  
- **Krishnendu Mitra**: Lead Developer and Architect of CHSCDN.  
- **Souvik Kar**: Frontend web Developer and Content code writter of CHSCDN.  

Together, we have built this **open-source CDN** to assist developers in utilizing CHSAPI effortlessly.  

## Technologies Used 🛠️  
- **JavaScript & TypeScript**: Core languages for building reusable CDN utilities.  
- **CSS**: Provides a consistent and visually appealing frontend experience.  
- **Node.js**: Supports seamless communication between CHSCDN and CHSAPI.  

## How It Works 🛠️  
1. **Include CHSCDN in Your Project**: Link the CDN in your HTML file.  
2. **Use Pre-Built Methods**: Simplified functions for making API requests.  
3. **Enhance Your UI**: Utilize image highlighters and representation features.  
4. **Enjoy Seamless Integration**: CHSCDN makes working with CHSAPI smooth and efficient.  

## Get Started 🚀  
To start using CHSCDN, simply include the CDN link in your project and explore the built-in functions! Our documentation will guide you through every step, ensuring easy implementation. but you can learn it from:
At first add our CDN (stylesheet, script) in your HTML file
```html
<link href="https://chscdn.vercel.app/cdn/v1/css/chscdn.min.css" rel="stylesheet" crossorigin="anonymous"/>
```
```html
<script src="https://chscdn.vercel.app/cdn/v1/js/chscdn.js" crossorigin="anonymous"></script>
```
and then open a javascript file where you access our pre-written codes, just copy past the following code for deepfake detection:
```js
// Connect the CHSCDN plugin
// Create an instance of the CHSCDN class
let chscdn = new CHSCDN();

// Define the local image path
let image = 'C:/Users/Pictures/dp.png';

// Convert the local image to a base64 string
let base64_image = await chscdn.image2base64(image); // Alternative: image_to_base64

// Set up API parameters
let api_value = { task: 'deepfake detect', media: base64_image };

// Receive the API response
let response = await chscdn.APICaller(api_value);

// Check for errors from the user side
if(chscdn.error_detect(response, 'mute')){
	console.error('Error occurred while calling CHS API!');
}else{
	// Display the result in the developer console
	console.log(response?.result?.class);
}
```
But if you work with any other enviroment like React Js or NEXT Js or Python then the above approch is not easy for you (application possible), so you can install our CHSCDN package on your system and then import our files to your code.
Install using NPM
```bash
npm install https://chscdn.vercel.app/npm/install
```
Install using PIP
```bash
pip install https://chscdn.vercel.app/pip/install
```
then import the packegs on your code to use in your way:
```js
// Import chscdn using npm at first
import React from 'react';
import 'chscdn/style.css ';
import { chscdn } from 'chscdn/script'; // Importing from the package  

const App = () => {
	// Create an instance of the chscdn class 
	const cdnInstance = new chscdn();
	/*....

	use that pre-buid code as you want

	....*/
	return (
		<>
		</>
	);
};

export default App;
```
But if you think to download it in your system and use it, then it is also possible:
```bash
curl -o ./chscdn/v1.zip "https://chscdn.vercel.app/download/zip/v1" && unzip -o ./chscdn/v1.zip -d ./chscdn/ && rm ./chscdn/v1.zip
```
Point to be noted that above all approches are more flexible which are not describe in just few words thats why please visit our Docs and Tutorial for more cleariness and easy to use.

## Advanced Stack Technology 🖼️  
![JPEN](https://kidKrishkode.github.io/Streamline-Diagnosis.github.io/images/jpen.png)  
The JPEN stack is a technology stack that combines the power of JSON, Python, Embedded JavaScript, and Node.js. JSON (J) is used for level data interchange and storage, providing a lightweight and flexible format for data exchange. Python (P) is used for mechine learning scripting, offering a robust and versatile language for building machine learning empower web applications. Embedded JavaScript (E) allows for dynamic client-side scripting, enabling interactive user experiences. Finally, Node.js (N) provides the runtime environment for executing JavaScript code on the server-side, enabling fast and scalable web development. Together, the JPEN stack enables developers to build scalable, and data driven or deep learning combined web applications.

## Developers 👨‍💻👩‍💻  
- **CDN Architect & Developer**: Krishnendu Mitra
- **CDN Content Developer**: Souvik Kar
- **API Optimization & Integration**: Saptarshi Pramanik  

## Contact Us 📬  
For support, collaborations, or any inquiries:  
- **Email**: info.whitelotus24@gmail.com  
- **LinkedIn**: [WHITE LOTUS](https://www.linkedin.com/)  
- **Twitter**: [@whitelotus](https://twitter.com/)  

---  

Explore **CHSCDN** and simplify API integration with CHSAPI today! 🚀
