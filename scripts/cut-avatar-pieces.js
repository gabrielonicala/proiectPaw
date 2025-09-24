const fs = require('fs');
const path = require('path');

// This script will create a simple HTML file that can be used to manually cut the avatar images
// Since we can't programmatically cut PNG images in Node.js without additional libraries,
// we'll create a visual tool to help with the cutting process

const createCuttingTool = () => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Avatar Piece Cutter</title>
    <style>
        body { 
            font-family: monospace; 
            background: #222; 
            color: white; 
            padding: 20px;
        }
        .container { 
            display: flex; 
            gap: 20px; 
            flex-wrap: wrap;
        }
        .avatar-section {
            border: 2px solid #444;
            padding: 10px;
            border-radius: 8px;
            background: #333;
        }
        .avatar-image {
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            border: 1px solid #666;
            margin: 5px;
        }
        .piece-preview {
            display: flex;
            flex-direction: column;
            gap: 5px;
            margin-top: 10px;
        }
        .piece {
            border: 2px solid #666;
            background: #444;
            padding: 5px;
            text-align: center;
        }
        .instructions {
            background: #444;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        button {
            background: #666;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 2px;
        }
        button:hover { background: #777; }
        .download-section {
            background: #444;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="instructions">
        <h2>Avatar Piece Cutter Tool</h2>
        <p>This tool helps you cut avatar images into head, top, and bottom pieces.</p>
        <p><strong>Instructions:</strong></p>
        <ol>
            <li>Right-click on each piece preview below</li>
            <li>Select "Save image as..." to save each piece</li>
            <li>Save head pieces to: <code>public/avatars/head/</code></li>
            <li>Save top pieces to: <code>public/avatars/top/</code></li>
            <li>Save bottom pieces to: <code>public/avatars/bottom/</code></li>
            <li>Name them descriptively (e.g., "male-warrior-helm.svg", "female-wizard-robe.svg")</li>
        </ol>
    </div>

    <div class="container" id="avatarContainer">
        <!-- Avatars will be loaded here -->
    </div>

    <div class="download-section">
        <h3>Download All Pieces</h3>
        <button onclick="downloadAllPieces()">Download All Pieces as ZIP</button>
        <p><em>Note: This will create a zip file with all the cut pieces ready to use.</em></p>
    </div>

    <script>
        // List of avatar images to process
        const maleAvatars = [
            'male/avatar.png', 'male/3.png', 'male/4.png', 'male/5.png', 'male/6.png',
            'male/7.png', 'male/8.png', 'male/9.png', 'male/10.png', 'male/11.png',
            'male/12.png', 'male/13.png', 'male/14.png', 'male/15.png', 'male/16.png',
            'male/17.png', 'male/18.png', 'male/19.png', 'male/20.png'
        ];
        
        const femaleAvatars = [
            'female/avatar.png', 'female/2.png', 'female/3.png', 'female/4.png', 'female/5.png',
            'female/6.png', 'female/7.png', 'female/8.png', 'female/9.png', 'female/10.png',
            'female/11.png', 'female/12.png', 'female/13.png', 'female/14.png', 'female/15.png',
            'female/16.png', 'female/17.png', 'female/18.png', 'female/19.png', 'female/20.png'
        ];

        function createAvatarSection(avatarPath, gender, index) {
            const section = document.createElement('div');
            section.className = 'avatar-section';
            
            const fileName = avatarPath.split('/').pop().replace('.png', '');
            const displayName = \`\${gender.charAt(0).toUpperCase() + gender.slice(1)} \${fileName}\`;
            
            section.innerHTML = \`
                <h3>\${displayName}</h3>
                <img src="/avatars/\${avatarPath}" alt="\${displayName}" class="avatar-image" style="width: 64px; height: 64px;">
                <div class="piece-preview">
                    <div class="piece">
                        <strong>Head Piece</strong><br>
                        <canvas id="head-\${gender}-\${index}" width="64" height="20" style="image-rendering: pixelated;"></canvas>
                        <br><button onclick="downloadPiece('head-\${gender}-\${index}', '\${gender}-\${fileName}-head.svg')">Download Head</button>
                    </div>
                    <div class="piece">
                        <strong>Top Piece</strong><br>
                        <canvas id="top-\${gender}-\${index}" width="64" height="24" style="image-rendering: pixelated;"></canvas>
                        <br><button onclick="downloadPiece('top-\${gender}-\${index}', '\${gender}-\${fileName}-top.svg')">Download Top</button>
                    </div>
                    <div class="piece">
                        <strong>Bottom Piece</strong><br>
                        <canvas id="bottom-\${gender}-\${index}" width="64" height="20" style="image-rendering: pixelated;"></canvas>
                        <br><button onclick="downloadPiece('bottom-\${gender}-\${index}', '\${gender}-\${fileName}-bottom.svg')">Download Bottom</button>
                    </div>
                </div>
            \`;
            
            return section;
        }

        function loadAvatars() {
            const container = document.getElementById('avatarContainer');
            
            // Load male avatars
            maleAvatars.forEach((avatar, index) => {
                const section = createAvatarSection(avatar, 'male', index);
                container.appendChild(section);
            });
            
            // Load female avatars
            femaleAvatars.forEach((avatar, index) => {
                const section = createAvatarSection(avatar, 'female', index);
                container.appendChild(section);
            });
            
            // Process all images to cut them into pieces
            setTimeout(processAllImages, 1000);
        }

        function processAllImages() {
            const images = document.querySelectorAll('.avatar-image');
            images.forEach((img, index) => {
                img.onload = () => {
                    cutAvatarIntoPieces(img, index);
                };
            });
        }

        function cutAvatarIntoPieces(img, index) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth || 64;
            canvas.height = img.naturalHeight || 64;
            
            ctx.drawImage(img, 0, 0);
            
            // Cut into pieces (adjust these values based on your avatar dimensions)
            const headHeight = Math.floor(canvas.height * 0.3); // Top 30%
            const topHeight = Math.floor(canvas.height * 0.4); // Middle 40%
            const bottomHeight = Math.floor(canvas.height * 0.3); // Bottom 30%
            
            // Head piece (top 30%)
            const headCanvas = document.getElementById(\`head-\${index < maleAvatars.length ? 'male' : 'female'}-\${index % maleAvatars.length}\`);
            if (headCanvas) {
                const headCtx = headCanvas.getContext('2d');
                headCtx.drawImage(canvas, 0, 0, canvas.width, headHeight, 0, 0, headCanvas.width, headCanvas.height);
            }
            
            // Top piece (middle 40%)
            const topCanvas = document.getElementById(\`top-\${index < maleAvatars.length ? 'male' : 'female'}-\${index % maleAvatars.length}\`);
            if (topCanvas) {
                const topCtx = topCanvas.getContext('2d');
                topCtx.drawImage(canvas, 0, headHeight, canvas.width, topHeight, 0, 0, topCanvas.width, topCanvas.height);
            }
            
            // Bottom piece (bottom 30%)
            const bottomCanvas = document.getElementById(\`bottom-\${index < maleAvatars.length ? 'male' : 'female'}-\${index % maleAvatars.length}\`);
            if (bottomCanvas) {
                const bottomCtx = bottomCanvas.getContext('2d');
                bottomCtx.drawImage(canvas, 0, headHeight + topHeight, canvas.width, bottomHeight, 0, 0, bottomCanvas.width, bottomCanvas.height);
            }
        }

        function downloadPiece(canvasId, filename) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/svg+xml');
            link.click();
        }

        function downloadAllPieces() {
            // This would require a more complex implementation
            alert('Please download each piece individually for now. A bulk download feature can be added later.');
        }

        // Load avatars when page loads
        window.onload = loadAvatars;
    </script>
</body>
</html>
`;

  return html;
};

// Write the HTML file
const htmlContent = createCuttingTool();
fs.writeFileSync('public/avatar-cutter.html', htmlContent);

console.log('Avatar cutting tool created at: public/avatar-cutter.html');
console.log('Open this file in your browser to cut the avatar images into pieces.');
