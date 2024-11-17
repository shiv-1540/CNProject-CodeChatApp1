import React, { useState, useEffect } from "react";
import { Input, Button } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const UploadFilePage = () => {
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const roomCode = location?.state?.roomCode;

  useEffect(() => {
    // Check if roomCode exists; if not, navigate back or show an error
    if (!roomCode) {
      console.error("Room code not provided");
      navigate("/error"); // Redirect to an error page or fallback
      return;
    }
    console.log(`room code: ${roomCode}`);
  }, [roomCode, navigate]);

  // Handle form submission
  const formSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", e.target.title.value);
    data.append("file-upload", e.target["file-upload"].files[0]);
    setFormData(data);
  };

  useEffect(() => {
    if (formData) {
      const submitData = async () => {
        try {
          const response = await axios.post(
            "http://localhost:3000/projectRoom/uploadFile",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          console.log(response.data);
          toast.success("Uploaded successfully");
          navigate(`/projectRoom/${roomCode}`);
        } catch (error) {
          console.error(error);
          toast.error("Upload failed");
        }
      };
      submitData();
      setFormData(null);
    }
  }, [formData, navigate, roomCode]);

  return (
    <main className="project-room-main-container">
      <form className="upload-file-container" onSubmit={formSubmit}>
        <h1 className="upload-file-title">Upload File</h1>
        <Input
          name="title"
          type="text"
          placeholder="File Name"
          size="md"
          variant="outline"
        />
        <input
          type="file"
          name="file-upload"
          id="file-upload"
          className="file-input-field"
        />
        <Button
          size="md"
          type="submit"
          style={{ marginTop: "1.25rem" }}
          className="upload-file-btn"
        >
          Upload
        </Button>
      </form>
    </main>
  );
};

export default UploadFilePage;
