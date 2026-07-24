import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, ExternalLink } from "lucide-react";
import "./Workspace_Building.css";

const messages = [
  "Extracting content...",
  "Analyzing research contributions...",
  "Generating AI summary...",
  "Building knowledge workspace...",
  "Preparing your experience..."
];

const Workspace_Building = ({ setActivePaper }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const paper = location.state?.paper;
  const hasRun = useRef(false);
  const abortControllerRef = useRef(null);
  const taskIdRef = useRef(null);
  const completedRef = useRef(false);
  const cancellingRef = useRef(false);
  const mountedRef = useRef(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const cancelActiveTask = useCallback(async (taskId = taskIdRef.current) => {
    if (!taskId) return;

    try {
      console.log("Cancelling task:", taskId);
      await fetch(`http://127.0.0.1:8000/api/cancel-analysis/${taskId}`, {
        method: "POST"
      });
    } catch (error) {
      console.error("Error cancelling workspace generation:", error);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!paper) {
      navigate("/search-paper");
      return;
    }

    mountedRef.current = true;

    if (hasRun.current) return;
    hasRun.current = true;

    const controller = new AbortController();
    const taskId = crypto.randomUUID();
    abortControllerRef.current = controller;
    taskIdRef.current = taskId;
    console.log("Created workspace task:", taskId);

    const buildWorkspace = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/analyze-paper", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('multimind_token')}`
          },
          body: JSON.stringify({
            paper_url: paper.pdf_url || paper.paper_url,
            task_id: taskId,
            title: paper.title,
            authors: paper.authors,
            abstract: paper.abstract,
            published_date: paper.year?.toString() || paper.published_date || paper.published_date_raw,
            source: paper.source
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Paper analysis failed");
        }

        const data = await response.json();

        if (data.status === "cancelled") {
          console.log("Workspace generation cancelled:", taskId);
          completedRef.current = true;
          if (!mountedRef.current) return;
          navigate("/search-paper");
          return;
        }

        const analyzedPaper = {
          ...paper,
          id: data.paper_id, // Store the MySQL database paper ID
          paper_understanding: data.analysis
        };

        completedRef.current = true;
        if (!mountedRef.current) return;
        setActivePaper(analyzedPaper);

        navigate("/workspace", {
          state: {
            paper: analyzedPaper
          }
        });
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Request cancelled");
          return;
        }

        if (!mountedRef.current) return;
        console.error("Error analyzing paper:", error);
        alert("Failed to build workspace. Please try again.");
        navigate("/search-paper");
      }
    };

    buildWorkspace();

    return () => {
      mountedRef.current = false;
    };
  }, [paper, navigate, setActivePaper, cancelActiveTask]);

  const stopBuilding = async () => {
    if (cancellingRef.current) return;
    cancellingRef.current = true;
    await cancelActiveTask();
    abortControllerRef.current?.abort();
    navigate("/search-paper");
  };

  return (
    <div className="workspace-building">
      <div className="workspace-building-card">
        <Loader2 className="workspace-spinner" />

        <h1 className="workspace-title">Building Workspace...</h1>

        <p className="workspace-status">{messages[messageIndex]}</p>

        <div className="workspace-paper-section">
          <h3>Explore the paper while we prepare your workspace</h3>

          <p className="paper-name">{paper?.title}</p>

          {(paper?.pdf_url || paper?.paper_url) && (
            <a
              href={paper.pdf_url || paper.paper_url}
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
      <div className="exit-button">
        <button className="stop-button" onClick={stopBuilding}>
          Exit WorkSpace
        </button>
      </div>
    </div>
  );
};

export default Workspace_Building;
