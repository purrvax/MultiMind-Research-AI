import React, { useState } from 'react';
import PaperCard from '../components/PaperCard';
import { Search, Sliders } from 'lucide-react';
import './SearchPaper.css';


const SearchPaper = ({ setActivePaper }) => {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [papers, setPapers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const sampleTags = [
    "Transformers",
    "Deep Learning",
    "Computer Vision",
    "GANs",
    "BERT"
  ];
  // API CALL FUNCTION
  const searchPapers = async(searchQuery, selectedLimit = limit)=>{
    if(!searchQuery.trim()){
      return;
    }
    setIsSearching(true);
    setHasSearched(true);

    console.log({
        query: searchQuery,
        limit: selectedLimit
    });

    try{
      const response = await fetch(
        "http://localhost:8000/api/search-papers",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            query:searchQuery,
            limit:limit
          })
        }
      );
      if(!response.ok){
        throw new Error(
          "Failed to fetch papers"
        );
      }
      const data = await response.json();
      setPapers(data.papers || []);

    }
    catch(error){
      console.log(
        "Search error:",
        error
      );
      setPapers([]);
    }
    finally{
      setIsSearching(false);
    }
  };
  const handleSearch = (e)=>{
    e.preventDefault();
    searchPapers(query,limit);
  };
  const selectSuggestedTag = (tag)=>{
    setQuery(tag);
  };
  return (
    <div 
      className="container-wide"
      style={{padding:'3rem 1.5rem'}}
    >
      <div className="page-title-section">
        <h1 className="page-title">
          Search Research Papers
        </h1>
        <p className="page-subtitle">
          Search research papers on any topic and discover relevant academic literature.
        </p>
      </div>
      <div className="search-controls-wrapper glass">
        <form onSubmit={handleSearch}>
          <div className="search-form-row">
            <div className="search-input-box">
              <Search
                className="search-input-icon"
                style={{
                  width:"1.25rem",
                  height:"1.25rem"
                }}
              />
              <input type="text" value={query}
                onChange={
                  (e)=>setQuery(e.target.value)
                }
                placeholder="Enter research topic"
                className="search-text-input"
              />
            </div>
            <div className="search-limit-box">
              <Sliders
                className="search-input-icon"
                style={{
                  width:"1rem",
                  height:"1rem",
                  position:"static"
                }}/>
              <select
                value={limit}
                  onChange={(e) => {
    const value = Number(e.target.value);

    console.log("Selected limit:", value);

    setLimit(value);
  }}
                className="limit-select"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="search-btn"
            >{isSearching?"Searching...":"Search"}
            </button>
          </div>
          <div className="tags-row">
            <span className="tags-label">
              Trending:
            </span>
            {
              sampleTags.map(
                (tag,index)=>(
                  <button
                    key={index}
                    type="button"
                    onClick={
                      ()=>selectSuggestedTag(tag)
                    }
                    className="tag-btn"
                  >{tag}</button>
                )
              )
            }
          </div>
        </form>
      </div>
      <div>
        <div className="results-header-row">
          <h2 className="results-title">
            { hasSearched?"Search Results":"Suggested Papers"}
            <span className="results-counter">
              {papers.length}
            </span>
          </h2>
        </div>
        { papers.length > 0?
          (
            <div className="cards-grid">
              {
                papers.map(
                  (paper)=>(
                    <PaperCard
                      key={
                        paper.id || paper.title
                      }
                      paper={paper}
                      onSelect={setActivePaper}
                    />
                  )
                )
              }
            </div>):(
            <div className="empty-results-card glass">
              <Search
                className="empty-results-icon"
              />
              <h3 className="empty-results-title">
                {hasSearched?"No papers found":"Search for papers"}
              </h3>
              <p className="empty-results-desc">
                Enter a research topic to find papers.
              </p>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default SearchPaper;