import { useEffect, useState, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Loader from "./Loader";
import TShirtModel from "./TShirtModel.jsx";
import UVEditor from "./UVEditor.jsx";
import "./CSS/index.css";
import "./CSS/uvEditor.css";
import Html from "./Html.jsx";

// New component to handle taking screenshots
const ScreenshotHandler = ({ screenshotRef }) => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (screenshotRef) {
      screenshotRef.current = () => {
        // Render the scene
        gl.render(scene, camera);

        // Get the canvas element and create a download link
        const canvas = gl.domElement;
        const dataURL = canvas.toDataURL("image/png");

        // Create a link element and trigger download
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `tshirt-design-${new Date()
          .toISOString()
          .slice(0, 10)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }
  }, [gl, scene, camera, screenshotRef]);

  return null;
};

export default function App() {
  const uvPort = useRef(null);
  const viewPort = useRef(null);
  const takeScreenshotRef = useRef(null);

  // Model state
  const [modelType, setModelType] = useState("t-shirt");
  const [customModelUrl, setCustomModelUrl] = useState(null);
  const [cameraPosition, setCameraPosition] = useState("front");
  const [roughness, setRoughness] = useState(0.5);
  const [metalness, setMetalness] = useState(0.5);
  const [texture, setTexture] = useState(0.5);
  const [textureType, setTextureType] = useState("cotton");
  const [designTexture, setDesignTexture] = useState(null);
  const [color, setColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#ffffff");

  // Load status
  const [loaded, setLoaded] = useState(false);

  // Function to take screenshot
  const handleScreenshot = () => {
    if (takeScreenshotRef.current) {
      takeScreenshotRef.current();
    }
  };

  // Switch between view and UV modes
  function handleView(view) {
    if (uvPort.current && viewPort.current) {
      if (view === 1) {
        uvPort.current.style.display = "none";
        viewPort.current.style.display = "flex";
      } else {
        uvPort.current.style.display = "flex";
        viewPort.current.style.display = "none";
      }
    }
  }

  // Initialize with view mode
  useEffect(() => {
    if (uvPort.current && viewPort.current) {
      uvPort.current.style.display = "none";
      viewPort.current.style.display = "flex";
    }
  }, [uvPort, viewPort]);

  // Function to update the model type and properties from HTML controls
  const updateModelSettings = (settings) => {
    if (settings.modelType) setModelType(settings.modelType);
    if (settings.customModelUrl) setCustomModelUrl(settings.customModelUrl);
    if (settings.cameraPosition) setCameraPosition(settings.cameraPosition);
    if (settings.roughness !== undefined) setRoughness(settings.roughness);
    if (settings.metalness !== undefined) setMetalness(settings.metalness);
    if (settings.texture !== undefined) setTexture(settings.texture);
    if (settings.textureType) setTextureType(settings.textureType);
    if (settings.color) setColor(settings.color);
    if (settings.bgColor) setBgColor(settings.bgColor);

    if (settings.designImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDesignTexture(event.target.result);
      };
      reader.readAsDataURL(settings.designImage);
    }
  };

  // Handle texture updates from the UV editor
  const handleTextureUpdate = (textureDataUrl) => {
    setDesignTexture(textureDataUrl);
  };

  return (
    <>
      {!loaded && <Loader onLoaded={() => setLoaded(true)} />}
      <div className="scenes">
        <div className="head-btn-cont">
          <button onClick={() => handleView(1)} className="view-btn head-btn">
            View
          </button>
          <button onClick={() => handleView(0)} className="uv-btn head-btn">
            UV
          </button>
        </div>
        <div ref={uvPort} className="uvWrapping">
          <UVEditor
            modelType={modelType}
            customModelUrl={customModelUrl}
            onTextureUpdate={handleTextureUpdate}
          />
        </div>
        <button
          title="download screen shot"
          className="icon-screenshot"
          onClick={handleScreenshot}
        >
          <i className="fa fa-download"></i>
        </button>
        <div ref={viewPort} className="viewPort">
          <Canvas
            style={{
              width: "100%",
              height: "100%",
            }}
            shadows
            gl={{
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.5,
              outputEncoding: THREE.sRGBEncoding,
              shadowMapType: THREE.PCFSoftShadowMap,
              antialias: true,
              preserveDrawingBuffer: true, // Important for screenshots
            }}
            camera={{
              fov: 50,
            }}
          >
            <ScreenshotHandler screenshotRef={takeScreenshotRef} />
            <color attach="background" args={[bgColor]} />
            <OrbitControls />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <TShirtModel
              color={color}
              roughness={roughness}
              metalness={metalness}
              texture={texture}
              textureType={textureType}
              designImage={designTexture}
              cameraPosition={cameraPosition}
              modelType={modelType}
              customModelUrl={customModelUrl}
            />
          </Canvas>
        </div>
      </div>
      <Html
        introFinished={loaded}
        onSettingsChange={updateModelSettings}
        cameraPosition={cameraPosition}
        roughness={roughness}
        metalness={metalness}
        texture={texture}
        textureType={textureType}
      />
      {/* Contact section */}
      <div className="footer">
        <div className="copyright-icons">
          © 2025 Amr Khamis. All rights reserved.
        </div>
        <div className="contact-icons">
          <a
            href="mailto:khamisamr90@gmail.com"
            className="contact-link"
            aria-label="Email Contact"
          >
            Contact Me
          </a>
        </div>
      </div>
    </>
  );
}
