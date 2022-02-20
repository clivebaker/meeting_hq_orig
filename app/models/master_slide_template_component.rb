class MasterSlideTemplateComponent < ApplicationRecord
  belongs_to :master_slide_template
  belongs_to :component

  default_scope {order(id: :desc)}

end
