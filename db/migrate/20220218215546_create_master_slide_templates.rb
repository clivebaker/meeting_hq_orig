class CreateMasterSlideTemplates < ActiveRecord::Migration[7.0]
  def change
    create_table :master_slide_templates do |t|
      t.string :name
      t.text :content
      t.boolean :enabled

      t.timestamps
    end
  end
end
