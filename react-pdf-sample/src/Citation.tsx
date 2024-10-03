import { useSetAtom } from "jotai";
import { Action, ReviewStatus } from "./Types";
import { uxAtom } from "./State";
import {
  CircleRegular,
  CheckmarkCircleFilled,
  DismissCircleFilled,
} from "@fluentui/react-icons";
import { useCallback } from "react";

// not selected
//    unreviewed  CircleRegular (no hover) - grey
//    approved    CheckmarkCircleFilled (no hover) - green
//    rejected    DismissCircleFilled (no hover) - red
// selected
//    approved
//      CheckmarkCircleFilled - green (hover: grey)
//    rejected
//      DismissCircleFilled - red (hover: grey)
//    unreviewed
//      approve button  CheckmarkCircleFilled - grey (hover: green)
//      reject button   DismissCircleFilled - grey (hover: red)

const reviewIcons = [ReviewStatus.Approved, ReviewStatus.Rejected];

const citationIcons = {
  [ReviewStatus.Unreviewed]: [CircleRegular, ["citation-icon-unreviewed", "citation-icon-unreviewed", "citation-icon-unreviewed"]],
  [ReviewStatus.Approved]: [CheckmarkCircleFilled, ["citation-icon-approved", "citation-icon-approved-off", "citation-icon-approved-on"]],
  [ReviewStatus.Rejected]: [DismissCircleFilled, ["citation-icon-rejected", "citation-icon-rejected-off", "citation-icon-rejected-on"]],
} as const;

interface Props {
  citationIndex: number; // the citation to render
  excerpt: string;
  reviewStatus: ReviewStatus;
  selected: boolean; // is this citation currently selected?
  selectable: boolean; // can this citation be selected?
}

export const CitationUX = ({
  citationIndex,
  excerpt,
  reviewStatus,
  selected,
  selectable,
}: Props) => {
  const _dispatch = useSetAtom(uxAtom);

  const dispatch = useCallback(
    (action: Action) => () => _dispatch(action),
    [_dispatch]
  );

  const toggleReviewStatus = useCallback(
    (target: ReviewStatus, citationIndex: number) =>
      (event: React.MouseEvent<SVGElement>) => {
        _dispatch({
          type: "toggleReviewStatus",
          target,
          citationIndex,
        });
        event.stopPropagation();
      },
    [_dispatch]
  );

  const reviewStatusIcons = (reviewStatus == ReviewStatus.Unreviewed && selected ? reviewIcons : [reviewStatus])
    .map((rs) => {
      const [icon, classNames] = citationIcons[rs];
      return [rs, icon, classNames[Number(selected) * (Number(reviewStatus == rs) + 1)]] as const;
    });

  return (
    <div
      className={"citation-row " + (selected ? "selected" : "hoverable")} 
      key={citationIndex}
      onClick={
        selectable
          ? dispatch({ type: "gotoCitation", citationIndex })
          : undefined
      }
    >
      <div>
        {reviewStatusIcons.map(([rs, Icon, className]) => (
          <Icon
            key={rs}
            className={"icon " + className}
            onClick={
              selected
                ? toggleReviewStatus(rs, citationIndex)
                : undefined
            } 
          />
        ))}
      </div>
      <div>
      {selected ? (
        <div className="citation-full">{excerpt}</div>
      ) : (
        <span className="citation-short">{excerpt.substring(0, 35)}...</span>
      )}
      </div>
    </div>
  );
};
