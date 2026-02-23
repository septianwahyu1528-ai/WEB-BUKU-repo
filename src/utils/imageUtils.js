// Utility functions for image handling

export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

export const compressImage = async (file, maxWidth = 800, maxHeight = 1000, quality = 0.8) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Calculate new dimensions
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => resolve(blob),
                    'image/jpeg',
                    quality
                );
            };
        };
    });
};

export const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a base64 data URL
    if (imagePath.startsWith('data:')) {
        return imagePath;
    }
    
    // If it's a filename, use public/images path
    if (!imagePath.startsWith('/')) {
        return `/images/${imagePath}`;
    }
    
    return imagePath;
};
