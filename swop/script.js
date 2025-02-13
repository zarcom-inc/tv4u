 (function(){
   // Replace this with your own code validation logic.
   var validCode = "1234";

   document.getElementById("codeSubmit").addEventListener("click", function(){
     var code = document.getElementById("codeInput").value.trim();
     if (code === validCode) {
       // Hide the code section and show the M3U input section.
       document.getElementById("codeSection").classList.add("hidden");
       document.getElementById("m3uSection").classList.remove("hidden");
     } else {
       document.getElementById("codeError").textContent = "Invalid code. Please try again.";
     }
   });

   document.getElementById("m3uSubmit").addEventListener("click", function(){
     var m3uLink = document.getElementById("m3uInput").value.trim();
     if (m3uLink === "") {
       document.getElementById("m3uError").textContent = "Please enter a valid m3u link.";
       return;
     }
     // Example: Redirect to the player page with the m3u link as a URL parameter.
     window.location.href = "player.html?m3u=" + encodeURIComponent(m3uLink);
     // Alternatively, if your player is on the same page, set its value here.
   });
 })();
