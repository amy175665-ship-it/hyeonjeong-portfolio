// Optimizes assets/models/avatar6.glb (original, ~23.5MB) into public/models/avatar6.glb (~1.3MB): drops the hidden
// dark duplicate hair (Hair_Web.001), unused vertex colour/UV sets, converts textures to WebP (hat fabric 512px, hair
// normal 1024px, face kept), and compresses geometry with meshopt (drei's useGLTF decodes it by default).
// Not a project dependency: run it from a scratch folder with the tools installed there, e.g.
//   npm i @gltf-transform/core@4 @gltf-transform/functions@4 @gltf-transform/extensions@4 meshoptimizer sharp
//   node optimize-glb.mjs <repo>/assets/models/avatar6.glb <repo>/public/models/avatar6.glb
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, prune, textureCompress, meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";

const [input, output] = process.argv.slice(2);
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(input);
const root = doc.getRoot();

// 1. The dark duplicate hair (material Hair_Web.001) is always hidden on the site: drop its node and mesh.
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (mesh && mesh.listPrimitives().some(p => p.getMaterial()?.getName() === "Hair_Web.001")) {
    console.log("remove node", node.getName());
    mesh.dispose();
    node.dispose();
  }
}
for (const node of root.listNodes()) if (node.getName() === "Female Bob Haircut.001" && node.listChildren().length === 0) { console.log("remove empty parent", node.getName()); node.dispose(); }

// 2. Extra vertex colour sets three.js never reads (it only uses COLOR_0), and TEXCOORD_1 when no texture uses it.
const usesUv1 = root.listMaterials().some(m => [m.getBaseColorTextureInfo(), m.getNormalTextureInfo(), m.getMetallicRoughnessTextureInfo(), m.getOcclusionTextureInfo(), m.getEmissiveTextureInfo()].some(info => info && info.getTexCoord() === 1));
console.log("TEXCOORD_1 used by a texture:", usesUv1);
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  for (const name of ["COLOR_1", "COLOR_2", "COLOR_3", ...(usesUv1 ? [] : ["TEXCOORD_1"])]) {
    const attr = prim.getAttribute(name);
    if (attr) { prim.setAttribute(name, null); console.log("drop", mesh.getName(), name); }
  }
}

await doc.transform(
  prune({ keepAttributes: true }),
  dedup(),
  // 3. Textures to WebP: the hat fabric maps to 512px, the hair normal to 1024px, the face keeps its size.
  textureCompress({ encoder: sharp, targetFormat: "webp", quality: 90, pattern: /^Image_0$/ }),
  textureCompress({ encoder: sharp, targetFormat: "webp", quality: 85, resize: [512, 512], pattern: /Fabric.*(Color|Roughness)/ }),
  textureCompress({ encoder: sharp, targetFormat: "webp", quality: 92, resize: [512, 512], pattern: /Fabric.*Normal/ }),
  textureCompress({ encoder: sharp, targetFormat: "webp", quality: 92, resize: [1024, 1024], pattern: /hair_bake_normal/ }),
  // 4. Geometry: meshopt compression (drei's useGLTF decodes it by default).
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);
await io.write(output, doc);
for (const t of root.listTextures()) console.log("texture", t.getName(), t.getMimeType(), t.getSize()?.join("x"), Math.round(t.getImage().byteLength / 1024) + "KB");
