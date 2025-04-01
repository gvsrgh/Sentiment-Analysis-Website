document.addEventListener("DOMContentLoaded", () => {
  // Tab switching functionality
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabBtns.forEach((b) => b.classList.remove("active"))
      tabContents.forEach((c) => c.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      btn.classList.add("active")
      const tabId = btn.getAttribute("data-tab")
      document.getElementById(`${tabId}-tab`).classList.add("active")
    })
  })

  // Analyze button functionality
  const analyzeBtn = document.getElementById("analyze-btn")
  const loadingOverlay = document.getElementById("loading-overlay")
  const resultCard = document.getElementById("result-card")
  const sentimentText = document.getElementById("sentiment-text")
  const sentimentIcon = document.getElementById("sentiment-icon")
  const confidenceLevel = document.getElementById("confidence-level")
  const analyzedText = document.getElementById("analyzed-text")

  analyzeBtn.addEventListener("click", async () => {
    // Get active tab
    const activeTab = document.querySelector(".tab-content.active")
    let text = ""

    if (activeTab.id === "text-tab") {
      text = document.getElementById("review-text").value.trim()
      if (!text) {
        alert("Please enter some text to analyze")
        return
      }
    } else {
      const link = document.getElementById("review-link").value.trim()
      if (!link) {
        alert("Please enter a review link")
        return
      }
      // For now, we'll just alert that this feature is coming soon
      alert("Link analysis will be implemented in future updates")
      return
    }

    // Show loading overlay
    loadingOverlay.classList.add("active")

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Server error")
      }

      const data = await response.json()

      // Update UI with results
      resultCard.classList.remove("hidden", "positive", "neutral", "negative")
      resultCard.classList.add(data.sentiment)

      sentimentText.textContent = data.sentiment.toUpperCase()
      analyzedText.textContent = data.text

      // Add a note if using mock prediction
      if (data.using_mock) {
        const mockNote = document.createElement("div")
        mockNote.className = "mt-2 text-sm text-gray-500"
        // mockNote.textContent = "(Used Grid CV Search for prediction)"
        sentimentText.parentNode.appendChild(mockNote)
      }

      // Update icon based on sentiment
      sentimentIcon.className = "fas"
      if (data.sentiment === "positive") {
        sentimentIcon.classList.add("fa-smile")
      } else if (data.sentiment === "neutral") {
        sentimentIcon.classList.add("fa-meh")
      } else {
        sentimentIcon.classList.add("fa-frown")
      }

      // Animate confidence level (for visual effect)
      confidenceLevel.style.width = "0%"
      setTimeout(() => {
        confidenceLevel.style.width = "85%"
      }, 100)
    } catch (error) {
      console.error("Error:", error)
      alert("An error occurred while analyzing the sentiment: " + error.message)
    } finally {
      // Hide loading overlay
      loadingOverlay.classList.remove("active")
    }
  })

  // Add animation to elements when they come into view
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".input-section, .result-section")

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top
      const screenPosition = window.innerHeight / 1.3

      if (elementPosition < screenPosition) {
        element.style.opacity = "1"
        element.style.transform = "translateY(0)"
      }
    })
  }

  // Initial animation
  setTimeout(() => {
    document.querySelectorAll(".input-section, .result-section").forEach((el) => {
      el.style.opacity = "1"
      el.style.transform = "translateY(0)"
    })
  }, 300)

  // Listen for scroll events
  window.addEventListener("scroll", animateOnScroll)
})

