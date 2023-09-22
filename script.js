document.addEventListener("DOMContentLoaded", function () {
    // Function to create a new iframe
    function createNewIframe() {
        const iframe = document.createElement("iframe");
        iframe.frameBorder = 0;
        document.body.appendChild(iframe);
        return iframe;
    }

    // Function to open images in separate iframes and adjust iframe size
    function openImageInIframe(imageUrl) {
        const imageFrame = createNewIframe();

        // Create an image element to get the image size
        const img = new Image();
        img.src = imageUrl;

        img.onload = function () {
            const width = img.width;
            const height = img.height;
            
            // Set iframe size based on image size
            imageFrame.width = width;
            imageFrame.height = height;

            // Load the image in the iframe
            imageFrame.src = imageUrl;
        };
    }

    // Add event listener to the Split Sentences button
    document.getElementById("splitButton").addEventListener("click", function () {
        const inputText = document.getElementById("inputText").value;
        const sentences = inputText.split(/\s*[.!?]\s*/);
        const outputContainer = document.getElementById("outputContainer");

        outputContainer.innerHTML = ""; // Clear previous output

        sentences.forEach((sentence, index) => {
            const sentenceTextarea = document.createElement("textarea");
            sentenceTextarea.classList.add("output-box");
            sentenceTextarea.value = sentence;
            outputContainer.appendChild(sentenceTextarea);
        });
    });

    // Add event listener to the Fetch from Internet button
    document.getElementById("fetchButton").addEventListener("click", async function () {
        const sentences = document.querySelectorAll(".output-box");
        const styles = document.querySelectorAll('input[name="style"]:checked');
        const seed = document.getElementById("seed").value;

        // Clear any existing iframes
        const existingIframes = document.querySelectorAll("iframe");
        existingIframes.forEach(iframe => {
            document.body.removeChild(iframe);
        });

        sentences.forEach(async (sentence, index) => {
            const prompt = encodeURIComponent(sentence.value);
            let styleString = "";
            styles.forEach(style => {
                styleString += style.value + "%20";
            });

            // Construct the URL with the seed value
            const url = `https://image.pollinations.ai/prompt/${prompt}%20${styleString}?seed=${seed}`;

            // Load each image in a separate iframe and adjust size dynamically
            openImageInIframe(url);
        });
    });

    // Add event listener to the Paste Text button
    document.getElementById("pasteTextButton").addEventListener("click", function () {
        const editableBox = document.getElementById("editableBox").value;
        const sentenceTextareas = document.querySelectorAll(".output-box");

        sentenceTextareas.forEach(sentenceTextarea => {
            sentenceTextarea.value += " " + editableBox; // Append text
        });
    });
});