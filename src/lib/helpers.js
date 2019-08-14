/**
 * Gets the area of a triangle given three keypoints
 *            1 ______2
 *            /\  A  /\
 *          /   \   /  \
 *         /  B  \ / C  \
 *        *-------*------*
 *       3        0        4
 *
 * 0 = nose
 * 1 = left eye
 * 2 = right eye
 * 3 = left ear
 * 4 = right ear
 */
export function getTrianglePerimeter(pose, keypoints) {
  const a = pose.keypoints[keypoints[0]].position;
  const b = pose.keypoints[keypoints[1]].position;
  const c = pose.keypoints[keypoints[2]].position;

  return (
    Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) +
    Math.sqrt(Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2)) +
    Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2))
  );
}
