import React, { useState, useEffect } from "react";
import { Camera, CameraResultType } from "@capacitor/camera";
import { Preferences } from "@capacitor/preferences";

function App() {
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState(null); // ảnh đang xem chi tiết

  // Lưu lại vào Preferences
  const savePhotos = async (updatedPhotos) => {
    setPhotos(updatedPhotos);
    await Preferences.set({
      key: "photos",
      value: JSON.stringify(updatedPhotos),
    });
  };

  // Chụp ảnh
  const takePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        quality: 90,
      });

      const newPhoto = {
        id: Date.now(), // ID duy nhất
        title: title || "Không tiêu đề",
        webPath: photo.webPath,
        date: new Date().toLocaleString(), // lưu thời gian chụp
      };

      const updatedPhotos = [newPhoto, ...photos];
      await savePhotos(updatedPhotos);
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

  // Xoá ảnh
  const deletePhoto = async (id) => {
    const updatedPhotos = photos.filter((p) => p.id !== id);
    await savePhotos(updatedPhotos);
    setSelected(null);
  };

  // Đổi tên ảnh
  const renamePhoto = async (id, newTitle) => {
    const updatedPhotos = photos.map((p) =>
      p.id === id ? { ...p, title: newTitle } : p
    );
    await savePhotos(updatedPhotos);
    setSelected(null);
  };

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
        {photos.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              cursor: "pointer",
              width: 160,
            }}
            onClick={() => setSelected(p)}
          >
            <img
              src={p.webPath}
              alt={p.title}
              style={{ width: "100%", height: 150, objectFit: "cover" }}
            />
            <p style={{ margin: "5px 0" }}>{p.title}</p>
            <small style={{ color: "gray" }}>{p.date}</small>
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
          onClick={() => setSelected(null)}
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
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.webPath}
              alt={selected.title}
              style={{ maxWidth: "100%", maxHeight: "60vh" }}
            />
            <h3>{selected.title}</h3>
            <p style={{ color: "gray" }}>{selected.date}</p>

            {/* Nút đổi tên */}
            <input
              type="text"
              placeholder="Đổi tiêu đề..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  renamePhoto(selected.id, e.target.value.trim());
                }
              }}
              style={{ marginTop: 10 }}
            />

            <div style={{ marginTop: 15 }}>
              <button
                onClick={() => deletePhoto(selected.id)}
                style={{
                  marginRight: 10,
                  padding: "5px 15px",
                  background: "red",
                  color: "white",
                }}
              >
                Xoá
              </button>
              <button
                onClick={() => setSelected(null)}
                style={{ padding: "5px 15px" }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
