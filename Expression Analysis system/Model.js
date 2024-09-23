import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const apiUrl = "https://api-inference.huggingface.co/models/trpakov/vit-face-expression";
const accessToken = "ACCESS TOKEN"; 
const folderPath = './uploads';  
const outputFileName = 'output.json';  


function getImagesFromDirectory(directory) {
    return fs.readdirSync(directory).filter(file => {
        const fileExtension = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(fileExtension);  
    });
}


async function query(imagePath) {
    try {
        const data = fs.readFileSync(imagePath);
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            method: 'POST',
            body: data
        });

        if (!response.ok) {
            throw new Error(`Error with status ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error querying the model:", error);
        return null;
    }
}


async function processImages() {
    const images = getImagesFromDirectory(folderPath);
    const results = [];

    for (const image of images) {
        const imagePath = path.join(folderPath, image);
        console.log(`Processing: ${imagePath}`);

        const result = await query(imagePath);  
        if (result) {
            results.push({ image: image, result: result[0] });  
        }
    }

    
    fs.writeFileSync(outputFileName, JSON.stringify(results, null, 4), 'utf8');
    console.log(`Results saved to ${outputFileName}`);
}


processImages();
