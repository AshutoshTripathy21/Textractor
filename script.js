const API_GET_URL = "https://jd5x8k2v4k.execute-api.us-east-1.amazonaws.com/prod/get-upload-url"; 
const API_EXTRACT_TEXT = "https://jd5x8k2v4k.execute-api.us-east-1.amazonaws.com/prod/extract-text";

async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const progressBar = document.getElementById("progressBar");
    const output = document.getElementById("output");
    const textContent = document.getElementById("text-content");

    if (!fileInput.files.length) {
        alert("Please select an image.");
        return;
    }

    const file = fileInput.files[0];
    const fileName = Date.now() + "-" + file.name;

    try {
        // Step 1: Get Pre-Signed URL
        progressBar.style.width = "10%";
        const presignedResponse = await fetch(API_GET_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: fileName, contentType: file.type })
        });

        if (!presignedResponse.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl } = await presignedResponse.json();

        // Step 2: Upload file to S3
        progressBar.style.width = "50%";
        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type }
        });

        if (!uploadResponse.ok) throw new Error("Upload to S3 failed");

        // Step 3: Extract Text from Image
        progressBar.style.width = "80%";
        setTimeout(async () => {
            const response = await fetch(API_EXTRACT_TEXT + "?fileName=" + fileName);
            const data = await response.json();

            textContent.textContent = data.text;
            output.style.display = "block";
            progressBar.style.width = "100%";
        }, 3000);
    } catch (error) {
        alert("Error: " + error.message);
    }
}
