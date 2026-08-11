export const IMAGE_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMzAwIDIwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk2YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=";

export const resolveImageUrl = (url, placeholder = IMAGE_PLACEHOLDER) => {
    if (!url || typeof url !== "string" || !url.trim()) return placeholder;

    const trimmedUrl = url.trim();

    if (trimmedUrl.startsWith("photo-")) {
        return `https://images.unsplash.com/${trimmedUrl}`;
    }

    const isValidUrl = trimmedUrl.startsWith("http://") || 
                       trimmedUrl.startsWith("https://") || 
                       trimmedUrl.startsWith("data:") || 
                       trimmedUrl.startsWith("/");

    return isValidUrl ? trimmedUrl : placeholder;
};