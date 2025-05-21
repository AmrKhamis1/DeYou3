import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";

export default function TShirtModel({
  color = "#ffffff",
  roughness = 0.5,
  metalness = 0.5,
  texture = 0.5,
  designImage = null,
  cameraPosition = "front",
  modelType = "t-shirt",
  textureType = "cotton",
  customModelUrl = null,
}) {
  const groupRef = useRef();
  const materialRef = useRef();
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the appropriate model based on modelType
  useEffect(() => {
    setIsLoading(true);

    let modelUrl;
    if (modelType === "custom" && customModelUrl) {
      modelUrl = customModelUrl;
    } else {
      // Use predefined models based on type
      switch (modelType) {
        case "sweatshirt":
          modelUrl = "/models/sweatshirt.glb"; // You would need to create these models
          break;
        case "football":
          modelUrl = "/models/football.glb";
          break;
        default:
          modelUrl = "/models/tshirt.glb";
          break;
      }
    }

    // Load the model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        // Apply materials to all meshes in the model
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            // Create a new material or clone the existing one
            const newMaterial = new THREE.MeshStandardMaterial();

            // Copy some properties from the original material if needed
            if (node.material) {
              //   if (node.material.map) newMaterial.map = node.material.map;
              if (node.material.normalMap)
                newMaterial.normalMap = node.material.normalMap;
            }

            // Apply our custom properties
            newMaterial.color = new THREE.Color(color);
            newMaterial.roughness = roughness;
            newMaterial.metalness = metalness;
            // newMaterial.normalScale = new THREE.Vector2(texture, texture);

            // Apply the design texture if provided
            if (designImage) {
              const textureLoader = new TextureLoader();
              const designTexture = textureLoader.load(designImage);
              designTexture.wrapS = THREE.RepeatWrapping;
              designTexture.wrapT = THREE.RepeatWrapping;
              designTexture.flipY = false;
              designTexture.encoding = THREE.sRGBEncoding;

              newMaterial.map = designTexture;
            }

            // Store a reference to the first material for future updates
            if (!materialRef.current) {
              materialRef.current = newMaterial;
            }

            // Apply the new material to the mesh
            node.material = newMaterial;
          }
        });

        setModel(gltf.scene);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error("An error occurred loading the model:", error);
        setIsLoading(false);
      }
    );
  }, [
    modelType,
    customModelUrl,
    color,
    roughness,
    metalness,
    texture,
    designImage,
  ]);

  // Update camera position
  useEffect(() => {
    if (groupRef.current) {
      // Reset rotation
      groupRef.current.rotation.set(0, 0, 0);

      // Apply rotation based on selected camera position
      switch (cameraPosition) {
        case "back":
          groupRef.current.rotation.y = Math.PI;
          break;
        case "left":
          groupRef.current.rotation.y = Math.PI / 2;
          break;
        case "right":
          groupRef.current.rotation.y = -Math.PI / 2;
          break;
        case "top":
          groupRef.current.rotation.x = -Math.PI / 2;
          break;
        case "bottom":
          groupRef.current.rotation.x = Math.PI / 2;
          break;
        default:
          // Front is default, no rotation needed
          break;
      }
    }
  }, [cameraPosition]);

  // Add a subtle rotation animation
  useFrame((state, delta) => {
    if (groupRef.current && !isLoading) {
      // Add a very subtle hovering motion
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  // Update materials when props change
  useEffect(() => {
    if (model) {
      model.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.color = new THREE.Color(color);
          node.material.roughness = roughness;
          node.material.metalness = metalness;

          if (node.material.normalScale) {
            node.material.normalScale.set(texture, texture);
          }

          node.material.needsUpdate = true;
        }
      });
    }
  }, [model, color, roughness, metalness, texture]);

  // Apply design texture if provided (after model changes)
  useEffect(() => {
    if (model && designImage) {
      const textureLoader = new TextureLoader();
      const designTexture = textureLoader.load(designImage);
      const normals = textureLoader.load("./temp/normal.png");
      normals.repeat.x = 9;
      normals.repeat.y = 9;
      normals.wrapS = THREE.RepeatWrapping;
      normals.wrapT = THREE.RepeatWrapping;
      designTexture.wrapS = THREE.RepeatWrapping;
      designTexture.wrapT = THREE.RepeatWrapping;
      designTexture.flipY = false;

      model.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.map = designTexture;
          node.material.side = THREE.DoubleSide;
          node.material.normalMap = normals;
          node.material.needsUpdate = true;
        }
      });
    }
  }, [model, designImage]);

  // Fallback loading representation
  if (isLoading) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1.5, 0.2]} />
        <meshStandardMaterial side={THREE.DoubleSide} color="#cccccc" />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      {model ? (
        <primitive
          object={model}
          scale={1}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "grab";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "auto";
          }}
        />
      ) : (
        // Fallback when model fails to load
        <mesh>
          <boxGeometry args={[2, 3, 0.2]} />
          <meshStandardMaterial
            ref={materialRef}
            color={color}
            roughness={roughness}
            metalness={metalness}
          />
        </mesh>
      )}
    </group>
  );
}
