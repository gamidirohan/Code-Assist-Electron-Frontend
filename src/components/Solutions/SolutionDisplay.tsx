import React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"
import { CopyButton } from "../ui/copy-button"

export const ContentSection = ({
  title,
  content,
  isLoading
}: {
  title: string
  content: React.ReactNode
  isLoading: boolean
}) => (
  <div className="space-y-2">
    <h2 className="text-[13px] font-medium text-white tracking-wide">
      {title}
    </h2>
    {isLoading ? (
      <div className="mt-4 flex">
        <p className="text-xs bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse">
          Extracting problem statement...
        </p>
      </div>
    ) : (
      <div className="text-[13px] leading-[1.4] text-gray-100 max-w-none overflow-y-auto max-h-48 p-3 bg-gray-800/30 rounded-md border border-gray-700/50">
        {content}
      </div>
    )}
  </div>
)

export const SolutionSection = ({
  title,
  content,
  isLoading,
  currentLanguage
}: {
  title: string
  content: React.ReactNode
  isLoading: boolean
  currentLanguage: string
}) => (
  <div className="space-y-2">
    <h2 className="text-[13px] font-medium text-white tracking-wide">
      {title}
    </h2>
    {isLoading ? (
      <div className="space-y-1.5">
        <div className="mt-4 flex">
          <p className="text-xs bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse">
            Loading solutions...
          </p>
        </div>
      </div>
    ) : (
      <div className="w-full relative border border-gray-700/50 rounded-md overflow-hidden">
        <CopyButton text={content as string} />
        <div className="max-h-96 overflow-y-auto">
          <SyntaxHighlighter
            showLineNumbers
            language={currentLanguage == "golang" ? "go" : currentLanguage}
            style={dracula}
            customStyle={{
              maxWidth: "100%",
              margin: 0,
              padding: "1rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              backgroundColor: "rgba(22, 27, 34, 0.5)",
              fontSize: "12px",
              lineHeight: "1.4"
            }}
            wrapLongLines={true}
          >
            {content as string}
          </SyntaxHighlighter>
        </div>
      </div>
    )}
  </div>
)

export const ComplexitySection = ({
  timeComplexity,
  spaceComplexity,
  timeComplexityExplanation,
  spaceComplexityExplanation,
  isLoading,
}: {
  timeComplexity: string | null;
  spaceComplexity: string | null;
  timeComplexityExplanation?: string | null;
  spaceComplexityExplanation?: string | null;
  isLoading: boolean;
}) => (
  <div className="space-y-2">
    <h2 className="text-[13px] font-medium text-white tracking-wide">
      Complexity
    </h2>
    {isLoading ? (
      <div className="space-y-1.5">
        <div className="mt-4 flex">
          <p className="text-xs bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse">
            Loading complexity analysis...
          </p>
        </div>
      </div>
    ) : (
      <div className="flex flex-col space-y-3 bg-black/30 rounded-md p-3 border border-gray-700/50 max-h-64 overflow-y-auto">
        <div className="flex flex-col">
          <div className="text-[13px] leading-[1.4] text-white/90">
            <span className="font-semibold">Time:</span> {timeComplexity}
          </div>
          {timeComplexityExplanation && (
            <div className="text-[12px] leading-[1.4] mt-1 text-white/70">
              {timeComplexityExplanation}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="text-[13px] leading-[1.4] text-white/90">
            <span className="font-semibold">Space:</span> {spaceComplexity}
          </div>
          {spaceComplexityExplanation && (
            <div className="text-[12px] leading-[1.4] mt-1 text-white/70">
              {spaceComplexityExplanation}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)
