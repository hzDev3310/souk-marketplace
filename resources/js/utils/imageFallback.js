export const imageFallback = (event) => {
    const image = event.currentTarget;

    if (image.dataset.placeholderApplied) {
        return;
    }

    image.dataset.placeholderApplied = 'true';
    image.src = '/images/default-placeholder.png';
};
