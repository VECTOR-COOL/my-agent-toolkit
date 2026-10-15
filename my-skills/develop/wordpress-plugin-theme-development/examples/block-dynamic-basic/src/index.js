import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from '../block.json';

registerBlockType(metadata.name, {
    edit({ attributes, setAttributes }) {
        const blockProps = useBlockProps();

        return (
            <div {...blockProps}>
                <InspectorControls>
                    <PanelBody title={__('設定', 'wp-skill-block-dynamic-basic')}>
                        <RangeControl
                            label={__('文章數量', 'wp-skill-block-dynamic-basic')}
                            value={attributes.count}
                            min={1}
                            max={6}
                            onChange={(count) => setAttributes({ count })}
                        />
                    </PanelBody>
                </InspectorControls>
                <p>{__('前台會顯示最新文章列表。', 'wp-skill-block-dynamic-basic')}</p>
            </div>
        );
    },
});
