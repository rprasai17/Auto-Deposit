document.addEventListener('DOMContentLoaded', () => {
    const element = document.getElementById('post-payment-toolbar-item');
    if (element) {
        console.log("element was found");
        element.click();
    } else {
        console.log("element not found");
    }
});
