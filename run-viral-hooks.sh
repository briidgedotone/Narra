#!/bin/bash

# Script to process viral hooks collection in batches
# It will automatically continue from where it left off

echo "🚀 Starting Viral Hooks Bulk Processing"
echo "====================================="

# Configuration
BATCH_SIZE=200
TOTAL_URLS=1013
BOARD_ID="d4f5e6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a"

# Function to run a batch
run_batch() {
    local start=$1
    local end=$2
    
    echo ""
    echo "📦 Processing batch: URLs $start to $end"
    echo "----------------------------------------"
    
    # Modify the continue script to start from the given index
    sed -i.bak "s/const START_INDEX = [0-9]*/const START_INDEX = $((start-1))/" scripts/continue-viral-hooks.ts
    
    # Run the script with timeout
    timeout 9m npx tsx scripts/continue-viral-hooks.ts
    
    local exit_code=$?
    if [ $exit_code -eq 124 ]; then
        echo "⏱️  Batch timed out after 9 minutes (expected behavior)"
    elif [ $exit_code -ne 0 ]; then
        echo "❌ Batch failed with exit code $exit_code"
        return $exit_code
    fi
    
    echo "✅ Batch completed"
    return 0
}

# Process in batches
current_index=336  # Start from where we left off
while [ $current_index -lt $TOTAL_URLS ]; do
    end_index=$((current_index + BATCH_SIZE))
    if [ $end_index -gt $TOTAL_URLS ]; then
        end_index=$TOTAL_URLS
    fi
    
    run_batch $current_index $end_index
    
    # Move to next batch
    current_index=$end_index
    
    # Small delay between batches
    if [ $current_index -lt $TOTAL_URLS ]; then
        echo "⏳ Waiting 5 seconds before next batch..."
        sleep 5
    fi
done

echo ""
echo "🎉 All batches completed!"
echo "========================"
echo "Check the board at: http://localhost:3000/boards/$BOARD_ID"