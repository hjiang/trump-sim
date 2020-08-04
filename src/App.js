import React, { useState } from "react";
import ImageUploader from "react-images-upload";
import { FileDrop } from "react-file-drop";
import axios from "axios";

import "./App.css";

function App() {
  const [picture, setPicture] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const reset = () => {
    setPicture(null);
    setError(null);
    setResult(null);
  };

  const onDrop = pics => {
    const pic = pics[0];
    setPicture(pic);
    const formData = new FormData();
    formData.append("image", pic, pic.name);
    axios
      .post("/api/1.0/classify-image", formData)
      .then(res => {
        if (res.status === 200) {
          setResult(res.data.result);
        } else {
          setError(res.data.message);
        }
      })
      .catch(setError);
  };

  return (
    <div className="App">
      <h1>Person, Woman, Man, Camera, TV classifier</h1>
      <FileDrop onDrop={onDrop}>
        {picture === null ? (
          <ImageUploader
            withIcon={true}
            buttonText="Choose an image"
            onChange={onDrop}
            singleImage={true}
            withPreview={false}
          />
        ) : (
          <img className="preview" src={URL.createObjectURL(picture)} />
        )}
      </FileDrop>
      {error !== null && <div className="error">{error}</div>}
      {result !== null && (
        <>
          <div className="result">
            <div className="text">{result}</div>
          </div>
          <button onClick={reset}>Try again</button>
        </>
      )}
    </div>
  );
}

export default App;
