// Configuração do Worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    scale = 1.0;

const canvas = document.getElementById('pdf-render'),
      ctx = canvas.getContext('2d');

// Renderiza a página especificada
const renderPage = num => {
  pageIsRendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    document.getElementById('page-num').textContent = num;
    document.getElementById('zoom-val').textContent = `${Math.round(scale * 100)}%`;
  });
};

const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// Navegação
document.getElementById('prev-page').addEventListener('click', () => {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
});

document.getElementById('next-page').addEventListener('click', () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
});

// Zoom
document.getElementById('zoom-in').addEventListener('click', () => {
  scale += 0.25;
  queueRenderPage(pageNum);
});

document.getElementById('zoom-out').addEventListener('click', () => {
  if (scale <= 0.5) return;
  scale -= 0.25;
  queueRenderPage(pageNum);
});

// Carregar PDF via Upload do Usuário
document.getElementById('file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file || file.type !== 'application/pdf') return;

  const fileReader = new FileReader();
  fileReader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(pdf => {
      pdfDoc = pdf;
      document.getElementById('page-count').textContent = pdf.numPages;
      pageNum = 1;
      renderPage(pageNum);
    });
  };
  fileReader.readAsArrayBuffer(file);
});