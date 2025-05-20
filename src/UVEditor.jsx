import { useRef, useState, useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export default function UVEditor({
  modelType = "t-shirt",
  customModelUrl = null,
  onTextureUpdate = () => {},
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const uvMapRef = useRef(null);

  // Image transformation state
  const [image, setImage] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState({ x: 1, y: 1 });
  const [imageRotation, setImageRotation] = useState(0);
  const [uvData, setUvData] = useState(null);

  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState("move"); // move, scale, rotate
  const [isLoading, setIsLoading] = useState(true);

  // Extract UV data from the model
  useEffect(() => {
    setIsLoading(true);

    let modelUrl;
    if (modelType === "custom" && customModelUrl) {
      modelUrl = customModelUrl;
    } else {
      // Use predefined models based on type
      switch (modelType) {
        case "sweatshirt":
          modelUrl = "/models/sweatshirt.glb";
          break;
        case "football":
          modelUrl = "/models/football.glb";
          break;
        default:
          modelUrl = "/models/tshirt.glb";
          break;
      }
    }

    // Load the model to extract UV coordinates
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const uvCoords = [];
        const uvIndexes = [];

        // Extract UV data from the model
        gltf.scene.traverse((node) => {
          if (node.isMesh && node.geometry) {
            const geometry = node.geometry;
            const uv = geometry.attributes.uv;
            const index = geometry.index;

            if (uv && index) {
              // Extract UV coordinates
              for (let i = 0; i < uv.count; i++) {
                uvCoords.push({
                  x: uv.getX(i),
                  y: uv.getY(i),
                });
              }

              // Extract face indices to draw UV map
              for (let i = 0; i < index.count; i += 3) {
                uvIndexes.push([
                  index.getX(i),
                  index.getX(i + 1),
                  index.getX(i + 2),
                ]);
              }
            }
          }
        });

        setUvData({ coords: uvCoords, indexes: uvIndexes });
        setIsLoading(false);
        drawUVMap();
      },
      undefined,
      (error) => {
        console.error("An error occurred loading the model:", error);
        setIsLoading(false);
      }
    );
  }, [modelType, customModelUrl]);

  // Listen for design image changes from parent component
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          // Center the image initially
          setImagePosition({ x: 0, y: 0 });
          setImageScale({ x: 1, y: 1 });
          setImageRotation(0);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw the UV map on the canvas
  const drawUVMap = () => {
    if (!canvasRef.current || !uvData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create an offscreen canvas for the UV map
    const uvCanvas = document.createElement("canvas");
    uvCanvas.width = width;
    uvCanvas.height = height;
    const uvContext = uvCanvas.getContext("2d");

    // Draw UV map
    uvContext.strokeStyle = "#888888";
    uvContext.lineWidth = 1;
    uvContext.beginPath();

    uvData.indexes.forEach((face) => {
      const v1 = uvData.coords[face[0]];
      const v2 = uvData.coords[face[1]];
      const v3 = uvData.coords[face[2]];

      // Convert UV coordinates to canvas space (UVs are 0-1, canvas is 0-width/height)
      // Note: No longer flipping the Y-axis to match Blender's UV coordinate system
      uvContext.moveTo(v1.x * width, v1.y * height);
      uvContext.lineTo(v2.x * width, v2.y * height);
      uvContext.lineTo(v3.x * width, v3.y * height);
      uvContext.lineTo(v1.x * width, v1.y * height);
    });

    uvContext.stroke();

    // Store the UV map for later
    uvMapRef.current = uvCanvas;

    // Draw the UV map on the main canvas
    ctx.drawImage(uvCanvas, 0, 0);

    // If we have an image, draw it with transformations
    drawImageWithTransformations();
  };

  // Draw the user's image with current transformations
  const drawImageWithTransformations = () => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    // Clear canvas and redraw UV map
    ctx.clearRect(0, 0, width, height);
    if (uvMapRef.current) {
      ctx.drawImage(uvMapRef.current, 0, 0);
    }

    // Apply transformations to draw the image
    ctx.save();

    // Move to center of canvas + user offset
    ctx.translate(width / 2 + imagePosition.x, height / 2 + imagePosition.y);

    // Apply rotation (convert to radians)
    ctx.rotate((imageRotation * Math.PI) / 180);

    // Apply scale
    ctx.scale(imageScale.x, imageScale.y);

    // Draw image centered
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    ctx.restore();

    // Generate texture from canvas and update parent
    generateTextureFromCanvas();
  };

  // Generate texture from current canvas state and send to parent
  const generateTextureFromCanvas = () => {
    if (!canvasRef.current || !image) return;

    // Create a temporary canvas for the final texture
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 1024; // Standard texture size
    tempCanvas.height = 1024;
    const tempCtx = tempCanvas.getContext("2d");

    // Fill with transparent background
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Get the current canvas with transformations
    const mainCanvas = canvasRef.current;

    // Calculate how to map the UV canvas to the texture canvas
    // Both are using the same coordinate space, just different dimensions
    const scaleX = tempCanvas.width / mainCanvas.width;
    const scaleY = tempCanvas.height / mainCanvas.height;

    tempCtx.save();

    // Scale the entire context to map UV space to texture space
    tempCtx.scale(scaleX, scaleY);

    // Draw only the image with transformations (not the UV grid)
    // We need to recalculate the transformations

    // Move to center of canvas + user offset
    tempCtx.translate(
      mainCanvas.width / 2 + imagePosition.x,
      mainCanvas.height / 2 + imagePosition.y
    );

    // Apply rotation
    tempCtx.rotate((imageRotation * Math.PI) / 180);

    // Apply scale
    tempCtx.scale(imageScale.x, imageScale.y);

    // Draw image centered
    tempCtx.drawImage(image, -image.width / 2, -image.height / 2);

    tempCtx.restore();

    // Convert to data URL and send to parent
    const textureDataUrl = tempCanvas.toDataURL("image/png");
    onTextureUpdate(textureDataUrl);
  };

  // Invert mouse Y coordinates for mouse interactions to match Blender behavior
  const getInvertedMouseCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Invert the Y coordinate to match Blender's coordinate system
    const y = rect.height + (e.clientY - rect.top);
    return { x, y };
  };

  // Set up event listeners for canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e) => {
      const coords = getInvertedMouseCoordinates(e);
      setIsDragging(true);
      setDragStart(coords);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const coords = getInvertedMouseCoordinates(e);
      const deltaX = coords.x - dragStart.x;
      // Invert deltaY to match the expected direction
      const deltaY = coords.y - dragStart.y;

      switch (dragMode) {
        case "move":
          setImagePosition((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));
          break;
        case "scale":
          // Calculate scale based on drag distance from center
          const scaleFactor = 1 + deltaY * 0.01;
          setImageScale((prev) => ({
            x: prev.x * scaleFactor,
            y: prev.y * scaleFactor,
          }));
          break;
        case "rotate":
          // Calculate angle based on drag movement
          const angle = deltaX * 0.5;
          setImageRotation((prev) => prev + angle);
          break;
      }

      setDragStart(coords);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      drawImageWithTransformations();
    };

    const handleWheel = (e) => {
      e.preventDefault();

      // Scale with mouse wheel
      const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;

      setImageScale((prev) => ({
        x: prev.x * scaleFactor,
        y: prev.y * scaleFactor,
      }));

      drawImageWithTransformations();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [isDragging, dragStart, dragMode]);

  // Redraw canvas when transforms or image changes
  useEffect(() => {
    drawImageWithTransformations();
  }, [image, imagePosition, imageScale, imageRotation]);

  // Redraw UV map when UV data changes
  useEffect(() => {
    if (uvData) {
      drawUVMap();
    }
  }, [uvData]);

  return (
    <div className="uv-editor-container">
      {isLoading ? (
        <div className="loading-uv">Loading UV Map...</div>
      ) : (
        <>
          <div className="uv-controls">
            <div className="uv-editor-tools">
              <button
                className={`tool-btn ${dragMode === "move" ? "active" : ""}`}
                onClick={() => setDragMode("move")}
              >
                <i className="fas fa-arrows-alt"></i> Move
              </button>
              <button
                className={`tool-btn ${dragMode === "scale" ? "active" : ""}`}
                onClick={() => setDragMode("scale")}
              >
                <i className="fas fa-expand-arrows-alt"></i> Scale
              </button>
              <button
                className={`tool-btn ${dragMode === "rotate" ? "active" : ""}`}
                onClick={() => setDragMode("rotate")}
              >
                <i className="fas fa-sync"></i> Rotate
              </button>
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                id="uv-image-upload"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                ref={imageRef}
              />
              <button
                className="tool-btn"
                onClick={() => imageRef.current.click()}
              >
                <i className="fas fa-upload"></i> Image
              </button>
              <button
                className="tool-btn"
                onClick={() => {
                  setImagePosition({ x: 0, y: 0 });
                  setImageScale({ x: 1, y: 1 });
                  setImageRotation(0);
                }}
              >
                <i className="fas fa-undo"></i> Reset
              </button>
              <button
                className="tool-btn apply-btn"
                onClick={generateTextureFromCanvas}
              >
                <i className="fas fa-check"></i> Apply
              </button>
            </div>

            <div className="uv-transform-info">
              <div>
                Position: X: {imagePosition.x.toFixed(0)}, Y:{" "}
                {imagePosition.y.toFixed(0)}
              </div>
              <div>Scale: {(imageScale.x * 100).toFixed(0)}%</div>
              <div>Rotation: {imageRotation.toFixed(1)}°</div>
            </div>
          </div>

          <div className="uv-canvas-container">
            <canvas
              ref={canvasRef}
              width={1024}
              height={1024}
              className="uv-canvas"
            />
            {!image && (
              <div className="uv-overlay">
                <p>Upload an image and position it over the UV map</p>
                <button onClick={() => imageRef.current.click()}>
                  <i className="fas fa-upload"></i> Select Image
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
