-- Execute once as the PostgreSQL schema owner/admin (the API role cannot grant
-- privileges on venus_rpa because that schema is owned by avnadmin).
--
-- The product_versions trigger calls fn_sync_rpa_receipt_from_version().
-- That function checks venus_rpa.rpa_stage_product, so the API role needs
-- schema USAGE and read access to that table.

GRANT USAGE ON SCHEMA venus_rpa TO venus_api;

DO $$
BEGIN
    IF to_regclass('venus_rpa.rpa_stage_product') IS NOT NULL THEN
        EXECUTE 'GRANT SELECT ON TABLE venus_rpa.rpa_stage_product TO venus_api';
    END IF;
END
$$;

-- The deferred product_versions trigger also invalidates any previous score.
-- The application role already has the required product_scores privileges, but
-- it needs to be able to record the invalidation history.
GRANT INSERT ON TABLE venus.product_score_history TO venus_api;

-- New OCR ingredients trigger an automatic risk refresh. The refresh reads
-- this view before the product version is flushed.
GRANT SELECT ON TABLE venus.v_ingredient_risk_inference_v2 TO venus_api;

-- The risk procedure writes the four approved dimensions for each new
-- ingredient before the product version is flushed.
GRANT INSERT ON TABLE venus.ingredient_risk_assessments TO venus_api;

-- Saving an OCR product label runs trg_auto_resolve_product_label. The
-- resolver clears old issues and inserts the new unresolved-token issues.
GRANT SELECT, INSERT, DELETE ON TABLE venus.product_ingredient_resolution_issues TO venus_api;
GRANT USAGE ON SEQUENCE venus.product_ingredient_resolution_product_ingredient_resolution_seq TO venus_api;

-- The resolver also reads and rebuilds the normalized OCR lookup keys.
GRANT SELECT, INSERT, DELETE ON TABLE venus.ingredient_resolution_keys TO venus_api;

-- Registering the resolved composition creates a current receipt.
GRANT INSERT ON TABLE venus.product_composition_receipts TO venus_api;
GRANT USAGE ON SEQUENCE venus.product_composition_receipts_product_composition_receipt_id_seq TO venus_api;

-- New ingredients create four risk-assessment rows through a sequence.
GRANT USAGE ON SEQUENCE venus.ingredient_risk_assessments_ingredient_risk_assessment_id_seq TO venus_api;

-- Deferred version readiness invalidates previous score history when present.
GRANT USAGE ON SEQUENCE venus.product_score_history_product_score_history_id_seq TO venus_api;
