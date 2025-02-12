// This is a placeholder function. You need to implement the actual API call.
export async function getVideoDetails(videoId: string) {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      title: `Video ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
    }
  }
  
  export function getVideoIdFromUrl(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }
  
  