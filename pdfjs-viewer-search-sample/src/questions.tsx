import { useState } from 'react';
import { docIntResponse, BoundingRegion } from "./interfaces";
import di from "../../di.json"
import { flushSync } from 'react-dom';

const response = di as docIntResponse;

const Reference = (props) => {
    const { reference, setFilePage, iframeRef } = props;

    // eventually this will be a DB call
    // for now just open the doc int response object
    const paragraphs = response.analyzeResult.paragraphs;

    // loop through paragraphs object
    // get relevant paragraph with matching text
    let foundBoundingRegions = [] as BoundingRegion[];
    paragraphs.forEach((paragraph) => {
        if (paragraph.content == reference.text) {
            foundBoundingRegions = paragraph.boundingRegions;
        }
    });

    const [shown, setShown] = useState(false);
    const [boundingRegions, setBoundingRegions] = useState(foundBoundingRegions);

    const draw = (context: CanvasRenderingContext2D, scale: number = 1, polygon: number[]) => {
        console.log("drawing...");
        const multiplier = 72 * (window.devicePixelRatio || 1) * scale;
        context.fillStyle = 'rgba(252, 207, 8, 0.3)';
        context.strokeStyle = '#fccf08';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(polygon[0] * multiplier, polygon[1] * multiplier);
        for (let i = 2; i < polygon.length; i += 2) {
            context.lineTo(polygon[i] * multiplier, polygon[i + 1] * multiplier);
        }
        context.closePath();
        context.fill();
        context.stroke();
        console.log("finished drawing!");
    };

    const preDraw = (pageNumber: number, polygon: number[]) => {
        const pages = iframeRef.current?.contentWindow?.document.getElementsByClassName("page") as HTMLCollection;

        console.log("looking for canvas...");
        let canvas;
        for (let index = 0; index < pages.length; index++) {
            let page = pages[index] as HTMLElement;
            let canvasPageNumber = Number(page.dataset.pageNumber);
            if (canvasPageNumber == pageNumber) canvas = page.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
        }
    
        if (canvas) {
            console.log("canvas found!");
            const highlightContext = canvas?.getContext('2d');
            const scale = parseFloat(iframeRef.current?.contentWindow?.getComputedStyle(canvas).getPropertyValue('--scale-factor') || '1');
            if (highlightContext) draw(highlightContext, scale, polygon);
        }
    };

    const showReference = (setFilePage: (arg0: number) => void ) => {
        let firstPage = 0;
        if (boundingRegions) { firstPage = boundingRegions[0].pageNumber; }
        
        let element = iframeRef.current?.contentWindow?.document.getElementById("pageNumber");
        let actualPageValue = element.value;
        
        flushSync(() => {
            if (actualPageValue != firstPage) setFilePage(actualPageValue);
        });

        flushSync(() => {
            setFilePage(firstPage);
        });

        element = iframeRef.current?.contentWindow?.document.getElementById("pageNumber");
        actualPageValue = element.value;

        if (!shown) {
            for (let index = 0; index < boundingRegions.length; index++) {
                const { pageNumber, polygon } = boundingRegions[index];
                preDraw(pageNumber, polygon);
            }
            setShown(true);
        }
    }

    return (
        <div key={Math.random()}>
            <p className="referenceContext">{reference.text}</p>
            <button onClick={() => showReference(setFilePage)}>show reference</button>
        </div>
    )
}

export function QuestionAnswer(props) {
    const { qA, ...otherProps } = props;

    let returnArray = [];
    returnArray.push(
        <div key="questionDiv" id="questionDiv"><p id="question">Question: </p><p id="question-text">{qA.question}</p></div>
    );
    returnArray.push(
        <label key="answer" id="answer">Answer: <input placeholder={qA.answer} /></label>
    );
    returnArray.push(
        <p key="referenceTitle" id="referenceTitle">Reference contexts</p>
    );

    for (let index = 0; index < qA.references.length; index++) {
        returnArray.push(
            <Reference key={Math.random()} reference={qA.references[index]} {...otherProps}/>
        )
    }

    return returnArray;
}
