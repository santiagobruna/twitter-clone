const IMAGE_MARKER = /(?:\n)?<!--img:(https?:\/\/[^\s>]+)-->/g

export function buildPostContent(text, imageUrl) {
  const caption = (text || '').trim()
  if (!imageUrl) return caption

  const marker = `\n<!--img:${imageUrl}-->`
  if (marker.length >= 280) return caption

  return `${caption.slice(0, 280 - marker.length)}${marker}`
}

export function getPostText(post) {
  return String(post?.content || '').replace(IMAGE_MARKER, '').trim()
}

export function getPostImage(post) {
  if (post?.image) return post.image
  const match = String(post?.content || '').match(/<!--img:(https?:\/\/[^\s>]+)-->/)
  return match?.[1] || ''
}
