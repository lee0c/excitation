import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { pdfjs } from 'react-pdf';
import { Sidebar } from './Sidebar';
import { Viewer } from './Viewer';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

import './App.css'

function App() {
  return (
    <div id="app">
      <Sidebar />
      <Viewer />
    </div>
  )
}

export default App
