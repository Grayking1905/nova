ALTER TABLE "WorkspaceState" ADD COLUMN "library" JSONB NOT NULL DEFAULT '{"folders":[],"files":[]}';
ALTER TABLE "Asset" ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'presentation';
