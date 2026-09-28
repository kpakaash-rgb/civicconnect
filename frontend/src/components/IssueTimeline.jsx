import { CheckCircle } from 'lucide-react';

export default function IssueTimeline({ timeline }) {
  // Find the first incomplete step index
  const currentIdx = timeline.findIndex((t) => !t.done);

  return (
    <div className="space-y-0">
      {timeline.map((item, index) => {
        const isLast = index === timeline.length - 1;
        const isDone = item.done;
        const isCurrent = index === currentIdx;
        const isPending = !isDone && !isCurrent;

        return (
          <div key={item.step} className="flex gap-3 relative">
            {/* Vertical connector line */}
            {!isLast && (
              <div
                className={`absolute left-[13px] top-[28px] w-0.5 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`}
                style={{ height: 'calc(100% - 4px)' }}
              />
            )}

            {/* Step icon */}
            <div className="flex-shrink-0 mt-0.5 relative z-10">
              {isDone ? (
                /* Completed — solid green check */
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                  <CheckCircle size={15} className="text-white" strokeWidth={2.5} />
                </div>
              ) : isCurrent ? (
                /* Current step — pulsing amber ring */
                <div className="w-7 h-7 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  {/* Outer pulse ring */}
                  <span className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-40" />
                </div>
              ) : (
                /* Pending — gray empty circle */
                <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                </div>
              )}
            </div>

            {/* Step content */}
            <div className={`pb-5 flex-1 min-w-0 ${isLast ? 'pb-1' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-semibold text-sm ${
                      isDone
                        ? 'text-gray-900'
                        : isCurrent
                        ? 'text-amber-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {item.step}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      CURRENT
                    </span>
                  )}
                </div>
                {item.date && (
                  <span className="text-xs text-gray-400 flex-shrink-0">{item.date}</span>
                )}
              </div>

              {item.note && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.note}</p>
              )}

              {isCurrent && !item.date && (
                <p className="text-xs text-amber-600 mt-0.5">Awaiting action from municipal team…</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
