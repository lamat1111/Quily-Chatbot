FROM node:20
RUN npm install -g @anthropic-ai/claude-code
RUN npx get-shit-done-cc --global
USER node
WORKDIR /workspace