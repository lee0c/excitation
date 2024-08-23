import { useState } from "react";
import { docIntResponse } from "./interfaces";
import di from "../../di.json"

const response = di as docIntResponse;

const draw = (context: CanvasRenderingContext2D, scale: number = 1, polygons: number[]) => {
    const multiplier = 72 * (window.devicePixelRatio || 1) * scale;
    context.fillStyle = 'rgba(252, 207, 8, 0.3)';
    context.strokeStyle = '#fccf08';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(polygons[0] * multiplier, polygons[1] * multiplier);
    for (let i = 2; i < polygons.length; i += 2) {
        context.lineTo(polygons[i] * multiplier, polygons[i + 1] * multiplier);
    }
    context.closePath();
    context.fill();
    context.stroke();
};

const preDraw = (iframeRef: React.RefObject<HTMLIFrameElement>, pageNumber: number, polygons: number[]) => {
    const elements = iframeRef.current?.contentWindow?.document.querySelectorAll("div.canvasWrapper > canvas") as NodeList;
    const element = elements.item(pageNumber - 1) as HTMLCanvasElement;
    if (element) {
        const highlightContext = element?.getContext('2d');
        const scale = parseFloat(iframeRef.current?.contentWindow?.getComputedStyle(element).getPropertyValue('--scale-factor') || '1');
        if (highlightContext) {
            draw(highlightContext, scale, polygons);
        }
    }
}
const findReferences = ({ text, fileName }: { text: string, fileName: string }, 
                        referenceIndex: number,
                        referenceShown: {},
                        setReferenceShown: (referenceShown: {}) => void,
                        setFilePage: (filePage: number) => void, 
                        setFileName: (fileName: string) => void,  
                        iframeRef: React.RefObject<HTMLIFrameElement>) => {
    // when you click on a specific citation
    // this runs to find the relevant document, page, and bounding box data
    setFileName(fileName);
    // fetch DI response from a db
    // actually for now, we just import the di.json file
    const paragraphs = response.analyzeResult.paragraphs;

    // loop through paragraphs object
    // get relevant paragraph with matching text
    let boundingRegions;
    paragraphs.forEach((paragraph) => {
        if (paragraph.content == text) {
            boundingRegions = paragraph.boundingRegions;
        }
    })

    // things we need:
    // page number for the iframe
    // bounding box
    if (boundingRegions) {
        const { pageNumber, polygon } = boundingRegions[0];
        setFilePage(pageNumber);
        let index = referenceIndex as keyof typeof referenceShown;
        if (referenceShown[index]) { preDraw(iframeRef, pageNumber, polygon); }
        let newReferenceShown = { ...referenceShown, referenceIndex: true };
        setReferenceShown(newReferenceShown);
    }
}

const References = (props) => {
    const { references, referenceShown, setReferenceShown, setFilePage, setFileName, iframeRef } = props;
    const returnArray = [];
    let newReferenceShown = {};
    for (let index = 0; index < references.length; index++) {
        const reference = references[index];

        // set referenceShown to false for each ref
        newReferenceShown = { ...newReferenceShown, index: false };

        returnArray.push(
            <div key={"reference" + index}>
                <p id="referenceContext">{reference.text}</p>
                <button onClick={() => findReferences(reference, referenceShown, setReferenceShown, index, setFilePage, setFileName, iframeRef)}>Display Document</button>
            </div>
        )
    }

    setReferenceShown(newReferenceShown);
    return returnArray;
}
export function QuestionAnswer(props) {
    const [referenceShown, setReferenceShown] = useState({});

    const { qA, ...otherProps } = props;
    return (
        <div id="question-container">
            <div><div id="question">Question: </div><div id="question-text">{qA.question}</div></div>
            <label id="answer" htmlFor="answer">Answer: </label><input name="answer" placeholder={qA.answer} /><input type="submit" />
            <p id="referenceTitle">Reference contexts</p>
            <References references={qA.references} referenceShown={referenceShown} setReferenceShown={setReferenceShown} {...otherProps} />
        </div>
    )
}
