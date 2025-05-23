import React, { useState, useEffect, useContext } from "react";
import { Button, Select, CloseButton } from "@chakra-ui/react";

import { DiJavascript } from "react-icons/di";
import { SiGoogledocs } from "react-icons/si";
import { FaFilePdf, FaImage, FaHtml5 } from "react-icons/fa";
import { SiCss3 } from "react-icons/si";
import { HiUpload } from "react-icons/hi";
import { IoMdAdd } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import nofiles from "../../assets/no-files.png";
import { toast } from "react-hot-toast";

const ProjectRoomPage = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [projectRoomData, setProjectRoomData] = useState({});
  const [projectRoomMembersData, setProjectRoomMembersData] = useState([]);
  const { authData } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [deleteFile, initiateDelete] = useState(false);
  const [fileId, setFileId] = useState(0);
  const [fileType, setSelectedFileType] = useState('all');

  const getInitials = (name) => {
    const nameParts = name.split(" ");
    return nameParts.map((part) => part.charAt(0).toUpperCase()).join("");
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "application/pdf":
        return <FaFilePdf size="2.6rem" color="#f1f1f1" />;
      case "text/html":
        return <FaHtml5 size="2.6rem" color="#f1f1f1" />;
      case "image/png":
        return <FaImage size="2.6rem" color="#f1f1f1" />;
      case "image/jgp":
        return <FaImage size="2.6rem" color="#f1f1f1" />;
      case "text/css":
        return <SiCss3 size="2.6rem" color="#f1f1f1" />;
      case "application/doc":
        return <SiGoogledocs size="2.6rem" color="#f1f1f1" />;
      case "text/javascript":
        return <DiJavascript size="2.6rem" color="#f1f1f1" />;
      default:
        return <SiGoogledocs size="2.6rem" color="#f1f1f1" />; // Default icon
    }
  };

  // Delete file useEffect
  useEffect(() => {
    if (deleteFile) {
      const deleteData = async () => {
        try {
          const response = await axios.delete(
            `http://localhost:3000/deleteFile/${fileId}`
          );
          console.log(response.data);
          toast.success("File deleted successfully");

          // After deletion, refetch files
          const updatedFiles = await axios.get(
            `http://localhost:3000/projectRoom/getAllData?fileType=${fileType}`
          );
          setFiles(updatedFiles.data); // Update the state with the new list of files
        } catch (error) {
          console.error(error);
          toast.error("Error deleting file");
        } finally {
          // Reset deleteFile and fileId states after the deletion is done
          initiateDelete(false);
          setFileId(0);
        }
      };

      deleteData(); // Call deleteData function
    }
  }, [deleteFile, fileId]); // Dependency on deleteFile and fileId

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/projectRoom/getAllData"
        );
        setFiles(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Error fetching files");
      }
    };
    fetchFiles();
  }, []);

  // function to copy roomcode
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(roomCode)
      .then(() => {
        toast.success("Room code copied!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy room code!");
      });
  };

  useEffect(() => {
    if (!authData?.token) {
      navigate("/");
      return;
    }

    axios
      .get(
        `http://localhost:3000/projectRoom/getProjectRoomDetail/${roomCode}`,
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          setProjectRoomData(response.data.projectDetails);
          setProjectRoomMembersData(response.data.membersInfo || []);
        }
      })
      .catch((error) => {
        console.error("Error fetching project room details:", error);
      });
  }, [authData, navigate, roomCode]);

  return (
    <main className="project-room-main-container">
      <div className="project-room-container">
        <header className="project-room-header">
          <div className="header-upper">
            <div className="headerbox">
              <h1>{projectRoomData.title || "Project Title"}</h1>
              <span>{projectRoomData.projectDomain}</span>
            </div>
            <div className="header-upper-group">
              <Button
                variant="outline"
                size="sm"
                style={{background:'#eee'}}
                onClick={() =>
                  navigate(`/joinCodeRoom`, {
                    state: { username: authData.username },
                  })
                }
              >
                Open Code Editor
              </Button>

              {/* Copy to Clipboard button */}
              <Button
                variant="solid"
                size="sm"
                colorScheme="teal"
                onClick={copyToClipboard}
              >
                Copy Room Code
              </Button>

              <CloseButton
                variant="solid"
                color="#fff"
                background="#444"
                onClick={() => {
                  navigate("/home");
                }}
              />
            </div>
          </div>
          <div className="header-lower">
            <p>
              {projectRoomData.description ||
                "Project description not available"}
            </p>
          </div>
        </header>
        <main className="project-room-content">
          <div className="project-room-content-members project-room-subcontainer">
            <div className="project-room-subcontainer-content">
              <h2>Members</h2>
              <div className="project-room-content-body">
                <ul>
                  {projectRoomMembersData.map((member) => (
                    <li
                      key={member._id}
                      className="project-room-content-body-items"
                    >
                      <div className="items-group">
                        <div className="item-icon">
                          <p>{getInitials(member.name)}</p>
                        </div>
                        <span>
                          <h3 className="item-name">{member.name}</h3>
                          <p>{member.email}</p>
                        </span>
                      </div>
                      <Button size="sm">Remove</Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="project-room-content-files project-room-subcontainer">
            <div className="project-room-subcontainer-content">
              <header className="subcontainer-content-header">
                <h2>Files</h2>
                <div className="subcontainer-content-header-group">

                  {/* filter drop down box */}
                  <Select
                    placeholder="File Type"
                    border="1px solid #5252528c"
                    background="transparent"
                    color="#cccc"
                    width="100%"
                    onChange={(e) => setSelectedFileType(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="doc">doc</option>
                    <option value="pdf">pdf</option>
                    <option value="image">image</option>
                    <option value="html">html</option>
                  </Select>
                  {/* filter drop down box */}

                  {/* file upload start */}
                  <Button
                    as="label"
                    htmlFor="file-upload"
                    variant="outline"
                    size="sm"
                    leftIcon={<HiUpload />}
                    cursor="pointer"
                    border="1px solid #5252528c"
                    background="transparent"
                    color="#ccc"
                    width="70%"
                    padding="1.2rem 1rem"
                    onClick={() => {
                      navigate("/upoadFilePage", {
                        state: { roomCode: roomCode },
                      });
                    }}
                  >
                    Upload file
                  </Button>
                  {/* file uplload end */}

                  <Button
                    variant="outline"
                    size="sm"
                    cursor="pointer"
                    border="1px solid #5252528c"
                    background="transparent"
                    color="#ccc"
                    padding="1.2rem 1rem"
                    leftIcon={<IoMdAdd />}
                    width="50%"
                  >
                    Create
                  </Button>
                </div>
              </header>

              {/* files shared part */}
              <div className="project-room-content-body">
                <ul>
                  {files.length === 0 ? (
                    <li
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <img src={nofiles} alt="" style={{ width: "35%" }} />
                      <p style={{ color: "#eee" }}>No files shared yet</p>
                    </li>
                  ) : (
                    files.map((file) => (
                      <li
                        className="project-room-content-body-items"
                        key={file.id}
                      >
                        <div className="items-group">
                          {/* Use getFileIcon to dynamically display the correct icon */}
                          {getFileIcon(file.file_type)}
                          <span>
                            <h3 className="item-name">{file.file_name}</h3>
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            initiateDelete(true);
                            setFileId(file.id);
                          }}
                        >
                          Delete
                        </Button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </main>
  );
};

export default ProjectRoomPage;
