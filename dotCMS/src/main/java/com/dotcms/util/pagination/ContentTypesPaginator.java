package com.dotcms.util.pagination;

import com.dotcms.contenttype.business.ContentTypeAPI;
import com.dotcms.contenttype.business.ContentTypeFactory;
import com.dotcms.contenttype.model.type.BaseContentType;
import com.dotcms.contenttype.model.type.ContentType;
import com.dotcms.contenttype.transform.contenttype.JsonContentTypeTransformer;
import com.dotcms.exception.ExceptionUtil;
import com.dotcms.repackage.com.google.common.annotations.VisibleForTesting;
import com.dotmarketing.business.APILocator;
import com.dotmarketing.business.DotStateException;
import com.dotmarketing.exception.DotDataException;
import com.dotmarketing.exception.DotRuntimeException;
import com.dotmarketing.exception.DotSecurityException;
import com.dotmarketing.portlets.workflows.business.WorkflowAPI;
import com.dotmarketing.portlets.workflows.model.SystemActionWorkflowActionMapping;
import com.dotmarketing.portlets.workflows.model.WorkflowScheme;
import com.dotmarketing.util.Logger;
import com.dotmarketing.util.PaginatedArrayList;
import com.dotmarketing.util.UtilMethods;
import com.liferay.portal.model.User;
import com.rainerhahnekamp.sneakythrow.Sneaky;
import io.vavr.control.Try;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.liferay.util.StringPool.BLANK;
import static com.liferay.util.StringPool.SPACE;

/**
 * This implementation of the {@link PaginatorOrdered} class handles the retrieval of paginated
 * results for {@link ContentType} objects in a high number of features in dotCMS.
 *
 * @author Freddy Rodriguez
 * @since Jun 27th, 2017
 */
public class ContentTypesPaginator implements PaginatorOrdered<Map<String, Object>>{

    private static final String N_ENTRIES_FIELD_NAME = "nEntries";
    public  static final String TYPE_PARAMETER_NAME  = "type";
    public static final String TYPES_PARAMETER_NAME  = "types";
    public static final String HOST_PARAMETER_ID = "host";
    public static final String SITES_PARAMETER_NAME = "sites";

    private final ContentTypeAPI contentTypeAPI;
    private final WorkflowAPI    workflowAPI;

    @VisibleForTesting
    public ContentTypesPaginator (final ContentTypeAPI contentTypeAPI) {
        this.contentTypeAPI = contentTypeAPI;
        this.workflowAPI    = APILocator.getWorkflowAPI();
    }

    public ContentTypesPaginator () {
        this(APILocator.getContentTypeAPI(APILocator.systemUser()));
    }

    /**
     * Returns the total amount of the specified Base Content Types living in a list of Site.
     *
     * @param condition Condition that the base Content Type needs to meet.
     * @param type      The Base Content Type to search for.
     * @param siteIds   One or more IDs of the Sites where the total amount of Content Types will be
     *                  determined.
     *
     * @return The total amount of Base Types living in the specified list of Site.
     */
    private long getTotalRecords(final String condition, final BaseContentType type, final List<String> siteIds) {
        return Sneaky.sneak(() ->this.contentTypeAPI.countForSites(condition, type, siteIds));
    }

    @Override
    @SuppressWarnings("unchecked")
    public PaginatedArrayList<Map<String, Object>> getItems(final User user, final String filter, final int limit, final int offset, final String orderBy,
            final OrderDirection direction, final Map<String, Object> extraParams) {
        final List<String> contentTypeList = Try.of(() -> (List<String>) extraParams.get(TYPES_PARAMETER_NAME)).getOrNull();
        final List<String> siteList = Try.of(() -> (List<String>) extraParams.get(SITES_PARAMETER_NAME)).getOrNull();
        final String typeName = Try.of(() -> extraParams.get(TYPE_PARAMETER_NAME).toString().replace("[",BLANK).replace("]", BLANK))
                .getOrElse(BaseContentType.ANY.name());
        final BaseContentType type = BaseContentType.getBaseContentType(typeName);

        final String ascOrder = OrderDirection.ASC.name().toLowerCase();
        final String descOrder = OrderDirection.DESC.name().toLowerCase();
        String orderByParam = UtilMethods.isSet(orderBy)
                ? orderBy.trim().toLowerCase()
                : ContentTypeFactory.MOD_DATE_COLUMN + SPACE + descOrder;

        if (!orderByParam.endsWith(SPACE + ascOrder) && !orderByParam.endsWith(SPACE + descOrder)) {
            orderByParam = orderByParam + SPACE + (UtilMethods.isSet(direction)
                    ? direction.toString().toLowerCase()
                    : ascOrder);
        }
        try {
            List<ContentType> contentTypes;
            final PaginatedArrayList<Map<String, Object>> result = new PaginatedArrayList<>();
            if (UtilMethods.isSet(contentTypeList)) {
                final Optional<List<ContentType>> optionalTypeList =
                        this.contentTypeAPI.find(contentTypeList, filter, offset, limit, orderByParam);
                contentTypes = optionalTypeList.orElseGet(ArrayList::new);
                result.setTotalResults(contentTypeList.size());
            } else if (UtilMethods.isSet(siteList)) {
                contentTypes = this.contentTypeAPI.search(siteList, filter, type, orderByParam,
                        limit, offset);
                result.setTotalResults(this.getTotalRecords(BLANK, type, siteList));
            } else {
                final String siteId = Try.of(() -> extraParams.get(HOST_PARAMETER_ID).toString()).getOrElse(BLANK);
                contentTypes = this.contentTypeAPI.search(filter, type, orderByParam, limit, offset, siteId);
                result.setTotalResults(this.getTotalRecords(filter, type, List.of(siteId)));
            }
            final List<Map<String, Object>> contentTypesTransform = transformContentTypesToMap(contentTypes);
            setEntriesAttribute(user, contentTypesTransform,
                    this.workflowAPI.findSchemesMapForContentType(contentTypes),
                    this.workflowAPI.findSystemActionsMapByContentType(contentTypes, user));
            result.addAll(contentTypesTransform);
            return result;
        } catch (final DotDataException | DotSecurityException e) {
            final String errorMsg = String.format("An error occurred when retrieving paginated Content Types: " +
                    "%s", ExceptionUtil.getErrorMessage(e));
            Logger.error(this, errorMsg, e);
            throw new DotRuntimeException(errorMsg, e);
        }
    }

    /**
     * Adds additional information related to the Content Types being returned by this Paginator. This new data is not
     * returned by the Content Type API, so other APIs must be accessed in order to provide it. Then, such data will be
     * added to the appropriate Content Type by adding it to its property Map.
     *
     * @param user                  The {@link User} performing this action.
     * @param contentTypesTransform The list of {@link ContentType} objects in the form of a list {@link Map} objects.
     * @param workflowSchemes       The Map containing the list of {@link WorkflowScheme} objects for every Content
     *                              Type.
     * @param systemActionMappings  The Map containing the list of {@link SystemActionWorkflowActionMapping} objects for
     *                              every Content Type.
     */
    private void setEntriesAttribute(final User user, final List<Map<String, Object>> contentTypesTransform,
                                     final Map<String, List<WorkflowScheme>> workflowSchemes,
                                     final Map<String, List<SystemActionWorkflowActionMapping>> systemActionMappings)  {

        Map<String, Long> entriesByContentTypes = null;

        try {
            entriesByContentTypes = APILocator.getContentTypeAPI
                    (user, true).getEntriesByContentTypes();
        } catch (final DotStateException | DotDataException e) {
            final String errorMsg = String.format("Error trying to retrieve total entries by Content Type: %s", e.getMessage());
            Logger.error(ContentTypesPaginator.class, errorMsg, e);
            Logger.debug(ContentTypesPaginator.class, e, () -> errorMsg);
        }

        for (final Map<String, Object> contentTypeEntry : contentTypesTransform) {

            final String variable = (String) contentTypeEntry.get("variable");
            if (entriesByContentTypes != null) {

                final String key = variable.toLowerCase();
                final Long contentTypeEntriesNumber = entriesByContentTypes.get(key) == null ? 0l :
                        entriesByContentTypes.get(key);
                contentTypeEntry.put(N_ENTRIES_FIELD_NAME, contentTypeEntriesNumber);
            } else {
                contentTypeEntry.put(N_ENTRIES_FIELD_NAME, "N/A");
            }

            if (workflowSchemes.containsKey(variable)) {

                contentTypeEntry.put("workflows", workflowSchemes.get(variable));
            }

            if (systemActionMappings.containsKey(variable)) {

                contentTypeEntry.put("systemActionMappings", workflowSchemes.get(variable));
            }
        }
    }

    /**
     * Transforms every Content Type in the list into a Map representation, which allows:
     * <ol>
     *     <li>An easier transformation of a Content Type into JSON data.</li>
     *     <li>Setting/retrieving properties more easily.</li>
     * </ol>
     * Additionally, this method removes unnecessary references to the fields in every Content Type, as they don't need
     * to be part of the response for this Paginator.
     *
     * @param contentTypes The list of {@link ContentType} objects that will be transformed.
     *
     * @return The list of Content Types as Maps.
     */
    private List<Map<String, Object>> transformContentTypesToMap(final List<ContentType> contentTypes) {
        return new JsonContentTypeTransformer(contentTypes)
                        .mapList()
                        .stream()
                        .map(contentTypeMap -> {
                            contentTypeMap.remove("fields");
                            return contentTypeMap;
                        })
                        .collect(Collectors.toList());
    }

}
