function createButton(articleLink) {
    let button = document.createElement('button');

    // Match the style of other buttons
    button.style.backgroundColor = 'green'; // Keep the green color
    button.style.borderRadius = '50%'; // Circular shape
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.cursor = 'pointer';
    button.style.width = '2em'; // Make the width relative
    button.style.height = '2em'; // Make the height relative
    button.style.border = 'none'; // Remove border
    button.style.padding = '0'; // Remove padding
    button.style.marginLeft = '8px'; // Add spacing between buttons
    button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'; // Subtle shadow
    button.url = "https://freedium.cfd/" + articleLink;

    // Inject SVG icon inside the button
    button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#B3B3B3" stroke-width="2"/>
        <path d="M10 10L14 6M14 6H10M14 6V10" stroke="#B3B3B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
`;


    // Set the button's URL
    console.log('Creating button with URL:', button.url);

    // Add click functionality
    button.onclick = function () {
        console.log('Button clicked:', button.url);
        window.open(button.url, '_blank');
    };

    return button;
}


function findCommonParent(el1, el2) {
    if (!el1 || !el2) {
        console.error('One or both elements are null:', el1, el2);
        return null;
    }

    let parents1 = [];
    let current = el1;

    // Collect all ancestors of el1
    while (current) {
        parents1.push(current);
        current = current.parentElement;
    }

    // Traverse the ancestors of el2 to find the first match
    current = el2;
    while (current) {
        if (parents1.includes(current)) {
            return current; // First common ancestor
        }
        current = current.parentElement;
    }

    console.log('No common parent found');
    return null;
}