import React, { useEffect, useState , useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, ExternalLink } from "lucide-react";
import "./Workspace_Building.css";

const Workspace_Building = ({ setActivePaper }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasRun = useRef(false);
  const paper = location.state?.paper;

  const messages = [
    "Extracting content...",
    "Analyzing research contributions...",
    "Generating AI summary...",
    "Building knowledge workspace...",
    "Preparing your experience..."
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => {clearInterval(interval);
    };
  }, []);

  // Build workspace
  useEffect(() => {
    let mounted = true;

    if (!paper) {
      navigate("/search-paper");
      return;
    }
    if (hasRun.current) return;
    hasRun.current = true;
    const buildWorkspace = async () => {
      try {
        console.log("Building workspace for:", paper.title);
        console.log("1.Starting Fetch");
        const response = await fetch(
          "http://127.0.0.1:8000/api/analyze-paper",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              paper_url: paper.pdf_url
            })
          }
        );
        console.log("2.Fetch Completed");
        console.log("Status:", response.status);
        if (!response.ok) {
          throw new Error("Paper analysis failed");
        }
        const data = await response.json();
        console.log("JSON PARSED")
        console.log(data.analysis);
        let analyzedPaper;
        try {
            console.log("Analysis type:", typeof data.analysis);
            console.log("Analysis exists:", !!data.analysis);
            console.log("Analysis keys:",
              Object.keys(data.analysis || {})
            );
            analyzedPaper = {
              ...paper,
              paper_understanding: data.analysis
            };

            console.log("3. OBJECT CREATED");
          } catch(err) {
            console.error("ERROR AFTER JSON:", err);
          }
        // Update global state + localStorage through App.jsx
        try {
          setActivePaper(analyzedPaper);
          console.log("STATE UPDATED");
        } catch (e) {
          console.error("SET STATE ERROR:", e);
        }
        navigate("/workspace", {
          state: {
            paper: analyzedPaper
          }
        });
        console.log("5. NAVIGATION CALLED");
      } catch (error) {
        if (!mounted) return;

        console.error("Error analyzing paper:", error);

        alert("Failed to build workspace. Please try again.");

        navigate("/search-paper");
      }
    };

    buildWorkspace();

    return () => {
      mounted = false;
    };
  }, [paper]);

  return (
    <div className="workspace-building">
      <div className="workspace-building-card">
        <Loader2 className="workspace-spinner" />

        <h1 className="workspace-title">
          Building Workspace...
        </h1>

        <p className="workspace-status">
          {messages[messageIndex]}
        </p>

        <div className="workspace-paper-section">
          <h3>
            Explore the paper while we prepare your workspace
          </h3>

          <p className="paper-name">
            {paper?.title}
          </p>

          {paper?.pdf_url && (
            <a
              href={paper.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="paper-pdf-btn"
            >
              Open Paper PDF
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace_Building;