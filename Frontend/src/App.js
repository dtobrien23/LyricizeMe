import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Skeleton,
  Stack,
} from "@chakra-ui/react";
import { BsSearch } from "react-icons/bs";
import dompurify from "dompurify";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [isStringProcessed, setIsStringProcessed] = useState(false);
  const [backendResponse, setBackendResponse] = useState(null);
  const [isResponseValid, setIsResponseValid] = useState(null);
  const [loading, setLoading] = useState(false);

  axios.defaults.timeout = 15000;
  axios.defaults.timeoutErrorMessage = "timeout";

  const processUserInput = (e) => {
    e.preventDefault();

    if (inputValue !== "") {
      if (backendResponse !== null) {
        setBackendResponse(null);
      }

      setLoading(true);
      setInputValue(
        inputValue
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/\$/g, "s")
          .replace(/the/g, "")
          .replace(/ /g, "")
          .replace(/[^\w\s]|_$/g, "")
      );
      setIsStringProcessed(true);
    }
  };

  const handleArtistSelection = () => {
    axios
      .post("http://127.0.0.1:5000/api/handle-artist-select", {
        // .post(
        //   "https://ec2-34-244-237-100.eu-west-1.compute.amazonaws.com:8000/api/handle-artist-select",
        //   {
        artist: inputValue,
      })
      .then((response) => {
        setBackendResponse(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
    setIsStringProcessed(false);
  };

  useEffect(() => {
    if (isStringProcessed === true) {
      handleArtistSelection();
    }
  }, [isStringProcessed]);

  useEffect(() => {
    if (backendResponse !== null) {
      setLoading(false);
      if (!backendResponse["empty"]) {
        setIsResponseValid(true);
        const imgElements = document.querySelectorAll("img");
        imgElements.forEach((img) => {
          if (img.id !== "logo") {
            img.style.height = "400px";
            img.style.width = "auto";
            img.style.margin = "20px";
          }
        });
      } else {
        setIsResponseValid(false);
      }
    }
  }, [backendResponse]);

  return (
    <Flex h="100vh" flexDirection="column">
      <Flex flex="1" flexDirection="column">
        <div
          style={{
            margin:
              loading === true || isResponseValid === true
                ? "20px 0px 0px 0px"
                : "20vh 0px 0px 0px",
            transition: "margin 0.3s ease",
          }}
        >
          <Flex justifyContent="center" alignItems="center" mb="30px">
            <Flex
              w="fit-content"
              onClick={() => {
                window.location.reload();
              }}
              cursor="pointer"
              justifyContent="center"
              alignItems="center"
            >
              <img
                id="logo"
                src="/images/music-file-icon.svg"
                alt="logo"
                style={{
                  marginRight: "8px",
                  marginTop: "0px",
                  height: "100px",
                }}
              />
              <h1
                style={{
                  marginLeft: "8px",
                  marginTop: "10px",
                  marginBottom: "0px",
                  fontFamily:
                    "Century Gothic, CenturyGothic, AppleGothic, sans-serif",
                  color: "black",
                  fontSize: "80px",
                }}
              >
                LyricizeMe
              </h1>
            </Flex>
          </Flex>

          <Flex justifyContent="center" alignItems="center">
            <form autocomplete="off" onSubmit={processUserInput}>
              <Flex
                padding="10px"
                width="50vw"
                borderRadius="25px"
                backgroundColor="white"
                alignItems="center"
                border="solid 3px #419f8f"
              >
                <BsSearch
                  color="#419f8f"
                  fontSize="20px"
                  style={{ marginLeft: "8px" }}
                />
                <input
                  placeholder="Enter an artist name to get some random lyrics and their meaning..."
                  // value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  style={{
                    fontSize: "20px",
                    border: "0px",
                    marginLeft: "10px",
                    width: "100%",
                  }}
                />
              </Flex>
              <Flex justifyContent="center" alignItems="center" mt="20px">
                <button
                  type="submit"
                  style={{
                    width: "100px",
                    height: "44px",
                    backgroundColor: "#6934d2",
                    borderRadius: "25px",
                    border: "0px",
                    fontSize: "15px",
                    color: "white",
                    padding: "10px 20px 10px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  SEARCH
                </button>
              </Flex>
            </form>
          </Flex>
        </div>
        {loading && (
          <Stack
            style={{
              margin: "12px 50px",
            }}
          >
            <Skeleton height="40px" width="30%" mb="5px" />
            <Skeleton height="25px" width="15%" mb="5px" />
            <Skeleton height="20px" width="25%" />
            <Skeleton height="20px" width="25%" />
            <Skeleton height="20px" width="25%" />
            <Skeleton height="20px" width="25%" mb="5px" />
            <Skeleton height="20px" width="90%" />
            <Skeleton height="20px" width="90%" />
            <Skeleton height="20px" width="90%" />
            <Skeleton height="20px" width="90%" />
          </Stack>
        )}
        {backendResponse !== null && (
          <div
            className="response"
            style={{
              margin: "10px 50px 20px 50px",
            }}
          >
            {backendResponse["empty"] ? (
              <Flex mt="10px">
                <Alert
                  status="error"
                  background="none"
                  justifyContent="center"
                  fontSize="20px"
                >
                  <AlertIcon boxSize="18px" />
                  <AlertTitle color="red">Sorry!</AlertTitle>
                  <AlertDescription>
                    {" "}
                    We couldn't find that artist
                  </AlertDescription>
                </Alert>
              </Flex>
            ) : (
              <>
                <h2 style={{ fontSize: "35px", paddingBottom: "0px" }}>
                  {backendResponse["song"]}
                </h2>
                <p style={{ fontSize: "20px" }}>{backendResponse["artist"]}</p>
                <p style={{ padding: "10px 0px" }}>
                  <span
                    style={{
                      backgroundColor: "#6934d2",
                      color: "white",
                      fontWeight: "bold",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: dompurify.sanitize(
                        backendResponse["lyric"].replace(/\n/g, "<br>")
                      ),
                    }}
                  ></span>
                </p>
                <div
                  dangerouslySetInnerHTML={{
                    __html: dompurify.sanitize(backendResponse["annotation"]),
                  }}
                ></div>
              </>
            )}
          </div>
        )}
      </Flex>
      <footer
        style={{
          display: "flex",
          height: "fit-content",
          width: "100%",
          color: "white",
          backgroundColor: "#419f8f",
          justifyContent: "center",
          padding: "20px 0px",
        }}
      >
        <p>
          &copy; {new Date().getFullYear()} LyricizeMe | Author: Dean O'Brien |
          Contact:{" "}
          <a href="mailto:dtobrien23@gmail.com">dtobrien23@gmail.com</a> | Data
          provided by:{" "}
          <a
            href="https://genius.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Genius API
          </a>{" "}
          &{" "}
          <a
            href="https://www.kaggle.com/datasets/carlosgdcj/genius-song-lyrics-with-language-information"
            target="_blank"
            rel="noopener noreferrer"
          >
            CarlosGDCJ
          </a>{" "}
          | Songs as recent as 2022
        </p>
      </footer>
    </Flex>
  );
}

export default App;
