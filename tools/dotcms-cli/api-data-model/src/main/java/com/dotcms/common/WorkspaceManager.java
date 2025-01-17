package com.dotcms.common;

import com.dotcms.model.config.Workspace;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Optional;

/**
 * This interface provides methods for resolving the workspace.
 */
public interface WorkspaceManager {

    /**
     * Finds the project root directory from any given path.
     * @param currentPath the current path
     * @return the workspace
     * @throws IOException if the workspace cannot be found or created.
     */
    Workspace getOrCreate(Path currentPath) throws IOException;

    /**
     * Finds the project root directory from any given path.
     * @param currentPath the current path
     * @param findWorkspace if true, it will try to find the workspace if it exists.
     * @return the workspace
     * @throws IOException if the workspace cannot be found or created.
     */
    Workspace getOrCreate(final Path currentPath, final boolean findWorkspace) throws IOException;

    /**
     * finds the project root directory from any given path.
     * @param currentPath the current path
     * @return the workspace
     */
    Optional<Workspace> findWorkspace(Path currentPath);

    /**
     * destroy a new workspace.
     * @param workspace the workspace to destroy.
     * @throws IOException if the workspace cannot be destroyed.
     */
    void destroy(final Workspace workspace) throws IOException;

}
