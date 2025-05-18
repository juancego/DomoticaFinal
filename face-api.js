document.getElementById('btnAccesoPadre').addEventListener('click', async () => {
  const video = document.getElementById('video');
  video.style.display = 'block';
  await navigator.mediaDevices.getUserMedia({ video: {} }).then(stream => {
    video.srcObject = stream;
  });

  await faceapi.nets.tinyFaceDetector.loadFromUri('/modelo');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/modelo');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/modelo');

  const labeledDescriptors = await loadLabeledImages(); // Tu imagen subida en Firebase
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

  video.addEventListener('play', () => {
    const interval = setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
      const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));

      if (results.some(r => r.label === 'Padre')) {
        clearInterval(interval);
        video.style.display = 'none';
        rol = 'padre';
        document.getElementById('accesoPadre').style.display = 'block';
        log('Acceso completo concedido al padre');
      }
    }, 2000);
  });
});
