import React, { useState, useEffect } from "react";
import { Camera, CameraResultType } from "@capacitor/camera";
import { Preferences } from "@capacitor/preferences";

function App() {
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState(null); // ảnh đang xem chi tiết

  // Chụp ảnh
  const takePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        quality: 90,
      });

      const newPhoto = {
        title: title || "Không tiêu đề",
        webPath: photo.webPath,
      };

      const updatedPhotos = [newPhoto, ...photos];
      setPhotos(updatedPhotos);

      await Preferences.set({
        key: "photos",
        value: JSON.stringify(updatedPhotos),
      });

      setTitle("");
    } catch (err) {
      console.error("Lỗi chụp ảnh:", err);
    }
  };

  // Load ảnh khi khởi động
  useEffect(() => {
    const loadPhotos = async () => {
      const { value } = await Preferences.get({ key: "photos" });
      if (value) setPhotos(JSON.parse(value));
    };
    loadPhotos();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>📷 Photo Journal</h1>

      <input
        type="text"
        placeholder="Nhập tiêu đề ảnh..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={takePhoto} style={{ marginLeft: 10 }}>
        Chụp ảnh
      </button>

      <h2>Gallery</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {photos.map((p, i) => (
          <div
            key={i}
            style={{ border: "1px solid #ccc", padding: 10, cursor: "pointer" }}
            onClick={() => setSelected(p)} // mở chi tiết khi click
          >
            <img
              src={p.webPath}
              alt={p.title}
              style={{ width: 150, height: 150, objectFit: "cover" }}
            />
            <p>{p.title}</p>
          </div>
        ))}
      </div>

      {/* Modal xem chi tiết ảnh */}
      {selected && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelected(null)} // click ra ngoài để đóng
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 10,
              maxWidth: "90%",
              maxHeight: "90%",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()} // tránh đóng khi click vào ảnh
          >
            <img
              src={selected.webPath}
              alt={selected.title}
              style={{ maxWidth: "100%", maxHeight: "70vh" }}
            />
            <h3>{selected.title}</h3>
            <button
              onClick={() => setSelected(null)}
              style={{ marginTop: 10, padding: "5px 15px" }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
