console.log('Script loaded successfully!');

document.addEventListener('DOMContentLoaded', () => {
    const secretElement = document.querySelector('.secret');
    if (secretElement) {
        secretElement.addEventListener('click', () => {
            alert('This is a secret message revealed by JavaScript!');
        });
        secretElement.style.cursor = 'pointer';
        secretElement.title = 'Click me!';
    }
});