"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Lightbulb, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import type { ModerationResult } from "@/lib/content-moderation"

interface ContentModerationFeedbackProps {
  result: ModerationResult
  onRetry: () => void
  className?: string
}

export default function ContentModerationFeedback({ result, onRetry, className = "" }: ContentModerationFeedbackProps) {
  if (result.issues.length === 0 && result.suggestions.length === 0) {
    return null
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500/50 bg-red-900/20"
      case "medium":
        return "border-yellow-500/50 bg-yellow-900/20"
      case "low":
        return "border-blue-500/50 bg-blue-900/20"
      default:
        return "border-slate-500/50 bg-slate-900/20"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "medium":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case "low":
        return <Lightbulb className="w-5 h-5 text-blue-400" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />
    }
  }

  const getSeverityTitle = (severity: string) => {
    switch (severity) {
      case "high":
        return "內容審核未通過"
      case "medium":
        return "內容建議優化"
      case "low":
        return "內容建議"
      default:
        return "內容檢查"
    }
  }

  return (
    <Card className={`${getSeverityColor(result.severity)} backdrop-blur-sm border ${className}`}>
      <CardContent className="p-4 space-y-4">
        {/* 標題區域 */}
        <div className="flex items-center gap-3">
          {getSeverityIcon(result.severity)}
          <div className="flex-1">
            <h4 className="font-semibold text-white text-sm md:text-base">{getSeverityTitle(result.severity)}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={`text-xs px-2 py-0.5 ${
                  result.severity === "high"
                    ? "bg-red-500/20 text-red-200 border-red-400/30"
                    : result.severity === "medium"
                      ? "bg-yellow-500/20 text-yellow-200 border-yellow-400/30"
                      : "bg-blue-500/20 text-blue-200 border-blue-400/30"
                }`}
              >
                {result.severity === "high" ? "需要修改" : result.severity === "medium" ? "建議優化" : "輕微建議"}
              </Badge>
              {!result.isAppropriate && (
                <Badge className="bg-red-500/20 text-red-200 border-red-400/30 text-xs px-2 py-0.5">無法提交</Badge>
              )}
            </div>
          </div>
          {!result.isAppropriate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-blue-200 hover:text-white hover:bg-blue-800/50 px-3"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              重新檢查
            </Button>
          )}
        </div>

        {/* 問題列表 */}
        {result.issues.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              發現的問題：
            </h5>
            <ul className="space-y-1">
              {result.issues.map((issue, index) => (
                <li key={index} className="text-sm text-red-100 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 建議列表 */}
        {result.suggestions.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-blue-200 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              改善建議：
            </h5>
            <ul className="space-y-1">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-100 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 被阻擋的詞彙 */}
        {result.blockedWords.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-red-200">需要修改的詞彙：</h5>
            <div className="flex flex-wrap gap-2">
              {result.blockedWords.map((word, index) => (
                <Badge key={index} className="bg-red-500/20 text-red-200 border-red-400/30 text-xs px-2 py-1">
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 鼓勵訊息 */}
        {!result.isAppropriate && (
          <Alert className="border-cyan-500/30 bg-cyan-900/20">
            <Lightbulb className="h-4 w-4 text-cyan-400" />
            <AlertDescription className="text-cyan-100 text-sm">
              我們理解工作中的挫折和困難。請使用更建設性的語言來描述遇到的問題，
              這樣我們能更好地幫助你找到解決方案。你的每一個真實困擾都很重要！
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
