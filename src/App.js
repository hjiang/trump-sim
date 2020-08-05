import React, { useState } from "react";
import ImageUploader from "react-images-upload";
import { FileDrop } from "react-file-drop";
import axios from "axios";

import "./App.css";

const makeImg = image => {
  return new Promise((resolve, _reject) => {
    const img = new Image();
    img.onload = function() {
      resolve(img);
    };

    img.src = URL.createObjectURL(image);
  });
};

const downscaleDimension = ({ height, width }, limit) => {
  if (height > width && height > limit) {
    return { height: limit, width: width * (limit / height) };
  } else if (width > height && width > limit) {
    return { height: height * (limit / width), width: limit };
  } else {
    return { height, width };
  }
};

const renameToJpg = fname => {
  const pos = fname.lastIndexOf(".");
  return fname.substr(0, pos < 0 ? fname.length : pos) + ".jpg";
};

const resizeImage = (image, maxDimension) => {
  return new Promise((resolve, _reject) => {
    makeImg(image).then(img => {
      const newD = downscaleDimension(img, maxDimension);
      const canvas = document.createElement("canvas");

      canvas.width = newD.width;
      canvas.height = newD.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, newD.width, newD.height);
      ctx.canvas.toBlob(blob => {
        resolve(
          new File([blob], renameToJpg(image.name), {
            type: "image/jpeg",
            lastModified: Date.now()
          })
        );
      }, "image/jpeg");
    });
  });
};

function App() {
  const [picture, setPicture] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setPicture(null);
    setError(null);
    setResult(null);
    setLoading(false);
  };

  const onDrop = pics => {
    const pic = pics[0];
    setResult(null);
    setError(null);
    setPicture(pic);
    setLoading(true);
    resizeImage(pic, 512)
      .then(smallPic => {
        const formData = new FormData();
        formData.append("image", smallPic, smallPic.name);
        return axios.post(
          "https://trump-sim.avosapps.us/api/1.0/classify-image",
          formData
        );
      })
      .then(res => {
        if (res.status === 200) {
          setResult(res.data.result);
        } else {
          setError(res.data.message);
        }
      })
      .catch(setError)
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="App">
      <h1>Person, Woman, Man, Camera, TV</h1>
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
          <img
            className="preview"
            src={URL.createObjectURL(picture)}
            alt="preview"
          />
        )}
      </FileDrop>
      {error !== null && <div className="error">{error}</div>}
      {loading && (
        <div className="loading">
          Sending photo to the White House, please wait ...
        </div>
      )}
      {result !== null && (
        <>
          <div className="result">
            <div className="text">{result}</div>
          </div>
          <button onClick={reset}>Try again</button>
        </>
      )}
      <div className="credit">
        Hosted on <a href="https://netlify.com">Netlify</a> (frontend) and{" "}
        <a href="https://leancloud.app">LeanCloud</a> (backend).
      </div>
    </div>
  );
}

export default App;
