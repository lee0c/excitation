import { useAtomValue, useSetAtom } from "jotai";
import {
  citationsAtom,
  questionIndexAtom,
  uxAtom,
  dispatchAtom,
} from "./State";
import { questions } from "./Questions";
import { useCallback } from "react";
import { Action, ReviewStatus } from "./Types";

export function Sidebar() {
  const questionIndex = useAtomValue(questionIndexAtom);
  const citations = useAtomValue(citationsAtom);
  const ux = useAtomValue(uxAtom);
  const _dispatch = useSetAtom(dispatchAtom);

  const dispatch = useCallback(
    (action: Action) => () => _dispatch(action),
    [_dispatch]
  );

  const disablePrev = questionIndex === 0;
  const disableNext = questionIndex === questions.length - 1;

  const toggleReviewStatus = useCallback(
    (
        target: ReviewStatus.Approved | ReviewStatus.Rejected,
        citationIndex: number
      ) =>
      (event: React.MouseEvent<HTMLButtonElement>) => {
        _dispatch({
          type: "toggleReviewStatus",
          target,
          citationIndex,
        });
        event.stopPropagation();
      },
    [_dispatch]
  );

  return (
    <div id="sidebar">
      <div className="sidebar-header">
        <button
          disabled={disablePrev}
          onClick={dispatch({ type: "prevQuestion" })}
        >
          &lt;
        </button>
        <div className="q-number">Question #{questionIndex + 1}</div>
        <button
          disabled={disableNext}
          onClick={dispatch({ type: "nextQuestion" })}
        >
          &gt;
        </button>
      </div>
      <div className="question">{questions[questionIndex]}</div>
      <div className="citation-header">Citations:</div>
      <div>
        {citations[questionIndex].map(({ excerpt, reviewStatus }, i) => (
          <div
            className={
              "citation-row" +
              (!ux.explore && i === ux.citationIndex ? " selected" : "")
            }
            key={i}
            onClick={
              ux.explore
                ? undefined
                : dispatch({ type: "gotoCitation", citationIndex: i })
            }
          >
            <div className="citation">{excerpt}</div>
            <div className="buttons">
              {reviewStatus === ReviewStatus.Approved ||
              (!ux.explore &&
                i === ux.citationIndex &&
                reviewStatus === ReviewStatus.Unreviewed) ? (
                <button
                  className="cite-button"
                  style={{
                    backgroundColor:
                      reviewStatus === ReviewStatus.Approved
                        ? "palegreen"
                        : "grey",
                  }}
                  onClick={toggleReviewStatus(ReviewStatus.Approved, i)}
                >
                  ✓
                </button>
              ) : null}
              {reviewStatus === ReviewStatus.Rejected ||
              (!ux.explore &&
                i === ux.citationIndex &&
                reviewStatus === ReviewStatus.Unreviewed) ? (
                <button
                  className="cite-button"
                  style={{
                    backgroundColor:
                      reviewStatus === ReviewStatus.Rejected
                        ? "lightcoral"
                        : "grey",
                  }}
                  onClick={toggleReviewStatus(ReviewStatus.Rejected, i)}
                >
                  𐄂
                </button>
              ) : null}
            </div>
          </div>
        ))}
        <br />
        &nbsp;
        {ux.newCitation ? (
          <>
            <button
              onClick={dispatch({ type: "addSelection" })}
              disabled={ux.selectedText === ""}
            >
              add selection
            </button>
            &nbsp;
            <button onClick={dispatch({ type: "endNewCitation" })}>done</button>
          </>
        ) : (
          <button onClick={dispatch({ type: "startNewCitation" })}>
            new citation
          </button>
        )}
      </div>
    </div>
  );
}
