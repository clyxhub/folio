// Folio — chunk an artwork list into pages of `perPage`.

export function chunkWorks(artworks, perPage = 1) {
  const size = Math.max(1, perPage);
  const pages = [];
  for (let i = 0; i < artworks.length; i += size) {
    pages.push(
      artworks
        .slice(i, i + size)
        .map((a, k) => ({ a, no: i + k + 1 }))
    );
  }
  return pages;
}
