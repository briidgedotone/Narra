#!/bin/bash

# Best of Viral Hooks Transcript Backfill Runner
# This script runs the transcript backfill in the background with logging

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/viral-hooks-backfill.log"
PID_FILE="$PROJECT_DIR/viral-hooks-backfill.pid"

echo "🚀 Starting Best of Viral Hooks transcript backfill..."
echo "📂 Project directory: $PROJECT_DIR"
echo "📝 Log file: $LOG_FILE"
echo "🆔 PID file: $PID_FILE"
echo ""

# Check if script is already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "❌ Script is already running with PID $PID"
        echo "   Check progress: tail -f $LOG_FILE"
        exit 1
    else
        echo "🗑️ Removing stale PID file"
        rm "$PID_FILE"
    fi
fi

# Change to project directory
cd "$PROJECT_DIR"

# Start the script in background
echo "▶️ Starting transcript backfill in background..."
echo "⏰ Started at: $(date)"
echo ""

nohup npx tsx scripts/viral-hooks-transcript-backfill.ts > "$LOG_FILE" 2>&1 &
SCRIPT_PID=$!

# Save PID to file
echo $SCRIPT_PID > "$PID_FILE"

echo "✅ Script started successfully!"
echo "🆔 Process ID: $SCRIPT_PID"
echo "📝 Logs: tail -f $LOG_FILE"
echo "🛑 Stop: kill $SCRIPT_PID && rm $PID_FILE"
echo ""
echo "📊 Monitor progress with:"
echo "   tail -f $LOG_FILE"
echo "   grep 'PROGRESS UPDATE' $LOG_FILE"
echo "   grep 'completed!' $LOG_FILE"
echo ""

# Show first few lines of output
echo "📋 Initial output:"
sleep 3
head -20 "$LOG_FILE" 2>/dev/null || echo "   (Log file not created yet, check in a moment)"

echo ""
echo "🔄 Script is running in background. Use 'tail -f $LOG_FILE' to monitor progress."