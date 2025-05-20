# T-Shirt Design Mockup Application

This React application allows users to create mockups for t-shirt designs using React Three Fiber and Three.js. Users can upload designs, position them on a 3D model, and customize various material properties.

## Features

- Interactive 3D t-shirt model visualization
- UV mapping editor for precise design placement
- Material property customization (roughness, metalness, texture details)
- Multiple camera angles (front, back, left, right, top, bottom)
- Support for different model types (t-shirt, sweatshirt, football shirt)
- Custom model upload (.glb, .gltf formats)
- Design image upload and placement

## How It Works

The application consists of two main views:

1. **3D View** - Shows the t-shirt model with applied design and material properties
2. **UV Editor** - Allows precise placement of designs on the UV map of the model

### Application Flow

1. User uploads a design image and selects a model type
2. User adjusts material properties (color, roughness, metalness, etc.)
3. User switches to UV Editor to position the design on the model
4. The design is applied to the 3D model in real-time
5. User can switch between different camera angles to view the result

## Components

### App.jsx
The main component that orchestrates the application. It manages the state between the HTML controls, UV editor, and 3D model.

### TShirtModel.jsx
Handles the 3D model rendering using Three.js and React Three Fiber. It loads the appropriate model based on the selected type and applies materials and textures.

### UVEditor.jsx
Provides a canvas-based interface for positioning designs on the UV map of the model. It extracts UV coordinates from the model and allows dragging, scaling, and rotating the design.

### Html.jsx
Contains the control panel for adjusting model properties, uploading designs, and selecting model types.

## Technical Implementation

### 3D Model Loading
The application uses GLTFLoader to load 3D models in .glb or .gltf format. It applies materials to the loaded models based on user settings.

### UV Mapping
The UV editor extracts UV coordinates from the loaded model and displays them on a canvas. It allows positioning a design image over these coordinates.

### Texture Generation
When a design is placed on the UV map, a texture is generated from the canvas and applied to the 3D model in real-time.

### Material Properties
Users can adjust various material properties:
- Color: Changes the base color of the model
- Roughness: Controls how rough or smooth the surface appears
- Metalness: Controls how metallic the surface appears
- Details: Adjusts the intensity of normal mapping

## Adding New Models

To add new models:
1. Create or obtain a 3D model in .glb or .gltf format
2. Ensure the model has proper UV mapping
3. Place the model in the `/public/models/` directory
4. Update the model selection options in the HTML component

## Workflow

1. **Upload Design**: Click "Upload Your Design" to select an image file
2. **Select Model**: Choose a model type from the dropdown
3. **Adjust Material Properties**: Use sliders to set roughness, metalness, and details
4. **Position the Design**: Click the "UV" button to open the UV editor
5. **Place Design**: Drag, scale, and rotate the design on the UV map
6. **Apply to Model**: Click "Apply to Model" to update the 3D view
7. **View Result**: Switch back to "View" to see the final result

## Requirements

- Node.js
- React
- Three.js
- React Three Fiber
- @react-three/drei

## Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Navigate to `http://localhost:5173` in your browser

## Project Structure

```
/src
  /components
    App.jsx         # Main application component
    Html.jsx        # Control panel component
    TShirtModel.jsx # 3D model component
    UVEditor.jsx    # UV mapping editor component
    Loader.jsx      # Loading screen component
  /CSS
    index.css       # Main application styles
    htmll.css       # Control panel styles
    uvEditor.css    # UV editor styles
  main.jsx          # Application entry point

/public
  /models
    tshirt.glb      # T-shirt 3D model
    sweatshirt.glb  # Sweatshirt 3D model
    football.glb    # Football shirt 3D model
  /temp
    DeYou3logo2.png # Application logo
```

![image](https://github.com/user-attachments/assets/fc6cb2cc-b845-4ed1-8ec1-eec05d84a93d)


- Add support for multiple design placements on a single model
- Implement save/load functionality for designs
- Add more material options (emissive, transparency, etc.)
- Support for texturing different parts of the model separately
- Add export functionality for rendered designs
