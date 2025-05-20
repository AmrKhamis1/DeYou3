import "@fortawesome/fontawesome-free/css/all.min.css";
import "./CSS/htmll.css";
import { useRef, useState, useEffect } from "react";

export default function Html({
  introFinished,
  onSettingsChange,
  cameraPosition: initialCameraPosition = "front",
  roughness: initialRoughness = 0.5,
  metalness: initialMetalness = 0.5,
  texture: initialTexture = 0.5,
}) {
  const [cameraPosition, setCameraPosition] = useState(initialCameraPosition);
  const [roughness, setRoughness] = useState(initialRoughness);
  const [metalness, setMetalness] = useState(initialMetalness);
  const [texture, setTexture] = useState(initialTexture);
  const [modelType, setModelType] = useState("t-shirt");
  const [color, setColor] = useState("#ffffff");

  const customModelInputRef = useRef(null);
  const designImageRef = useRef(null);

  // Handle custom model file selection
  function handleCustomModel(modelValue) {
    setModelType(modelValue);

    if (customModelInputRef.current) {
      if (modelValue === "c-shert") {
        customModelInputRef.current.style.display = "flex";
      } else {
        customModelInputRef.current.style.display = "none";
      }
    }

    // Update parent component
    onSettingsChange({
      modelType:
        modelValue === "c-shert"
          ? "custom"
          : modelValue === "s-shert"
          ? "sweatshirt"
          : modelValue === "f-shert"
          ? "football"
          : "t-shirt",
    });
  }

  // Handle camera position change
  function handleCamera(position) {
    setCameraPosition(position);
    onSettingsChange({ cameraPosition: position });
  }

  // Handle roughness change
  function handleRoughness(value) {
    const roughnessValue = parseFloat(value);
    setRoughness(roughnessValue);
    onSettingsChange({ roughness: roughnessValue });
  }

  // Handle metalness change
  function handleMetalness(value) {
    const metalnessValue = parseFloat(value);
    setMetalness(metalnessValue);
    onSettingsChange({ metalness: metalnessValue });
  }

  // Handle texture detail change
  function handleTexture(value) {
    const textureValue = parseFloat(value);
    setTexture(textureValue);
    onSettingsChange({ texture: textureValue });
  }

  // Handle color change
  function handleColorChange(colorValue) {
    setColor(colorValue);
    onSettingsChange({ color: colorValue });
  }

  // Handle design image upload
  function handleDesignUpload(event) {
    const file = event.target.files[0];
    if (file) {
      onSettingsChange({ designImage: file });
    }
  }

  // Handle custom model upload
  function handleCustomModelUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSettingsChange({ customModelUrl: url });
    }
  }

  return (
    <div className="main">
      <div className="header">
        <img
          className="deImage"
          src="./temp/DeYou3logo2.png"
          alt="DeYou3Logo"
        />
      </div>
      <div className="centeral">
        <label htmlFor="design">Upload Your Design:</label>
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          name="design"
          id="design"
          onChange={handleDesignUpload}
          ref={designImageRef}
        />

        <label htmlFor="modelType">Select Your Model:</label>
        <select
          name="modelType"
          id="modelType"
          onChange={(event) => handleCustomModel(event.target.value)}
          value={modelType}
        >
          <option value="t-shert">t-shirt</option>
          <option value="s-shert">sweat shirt</option>
          <option value="f-shert">football shirt</option>
          <option value="c-shert">custom model</option>
        </select>

        <input
          ref={customModelInputRef}
          type="file"
          accept=".glb,.gltf"
          name="Cmodel"
          id="Cmodel"
          style={{ display: "none" }}
          onChange={handleCustomModelUpload}
        />

        <label htmlFor="color">Color:</label>
        <input
          type="color"
          name="color"
          id="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
        />

        <label htmlFor="camera-positions">Camera Position:</label>
        <div className="cameta-positions">
          <button
            onClick={() => handleCamera("front")}
            className={cameraPosition === "front" ? "active" : ""}
          >
            Front
          </button>
          <button
            onClick={() => handleCamera("back")}
            className={cameraPosition === "back" ? "active" : ""}
          >
            Back
          </button>
          <button
            onClick={() => handleCamera("left")}
            className={cameraPosition === "left" ? "active" : ""}
          >
            Left
          </button>
          <button
            onClick={() => handleCamera("right")}
            className={cameraPosition === "right" ? "active" : ""}
          >
            Right
          </button>
          <button
            onClick={() => handleCamera("top")}
            className={cameraPosition === "top" ? "active" : ""}
          >
            Top
          </button>
          <button
            onClick={() => handleCamera("bottom")}
            className={cameraPosition === "bottom" ? "active" : ""}
          >
            Bottom
          </button>
        </div>

        <div className="Matrials">
          <div>
            <label htmlFor="roughness">Roughness:</label>
            <input
              type="range"
              max={1}
              min={0}
              step={0.01}
              value={roughness}
              onChange={(event) => handleRoughness(event.target.value)}
              name="roughness"
              id="roughness"
            />
          </div>
          <div>
            <label htmlFor="metalness">Metalness:</label>
            <input
              type="range"
              max={1}
              min={0}
              step={0.01}
              value={metalness}
              onChange={(event) => handleMetalness(event.target.value)}
              name="metalness"
              id="metalness"
            />
          </div>
          <div>
            <label htmlFor="texture">Details:</label>
            <input
              type="range"
              max={1}
              min={0}
              step={0.01}
              value={texture}
              onChange={(event) => handleTexture(event.target.value)}
              name="texture"
              id="texture"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
